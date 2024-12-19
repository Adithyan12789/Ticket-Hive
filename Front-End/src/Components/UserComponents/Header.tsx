import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import {
  useGetUserProfileQuery,
  useFetchUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useClearAllNotificationsMutation,
} from "../../Slices/UserApiSlice";
import { logout } from "../../Slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../Store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import CitiesModal from "./CitiesModal";
import { NotificationDropdown } from "../UserComponents/NotificationDropdown";
import io from "socket.io-client";

const PROFILE_IMAGE_DIR_PATH = "http://localhost:5000/UserProfileImages/";
const DEFAULT_PROFILE_IMAGE = "/profileImage_1729749713837.jpg";

const socket = io("http://localhost:5000");

interface Notification {
  _id: number;
  message: string;
  createdAt: string;
}

interface UpdateNotificationsPayload {
  type: "markAsRead" | "clearAll";
  notificationId?: number; // Change to number to match Notification._id type
}

const Header: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: profileData } = useGetUserProfileQuery(userInfo?.id);
  const { data: fetchedNotifications = [] } = useFetchUnreadNotificationsQuery({}) as {
    data: Notification[];
  };
  const [clearAllNotifications] = useClearAllNotificationsMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(fetchedNotifications);
  }, [fetchedNotifications]);

  useEffect(() => {
    if (userInfo?.id) {
      socket.emit("joinNotifications", { userId: userInfo.id });

      socket.on("newNotification", (notification: Notification) => {
        console.log("Real-time: New notification received:", notification);
        setNotifications(prevNotifications => [notification, ...prevNotifications]);
      });

      socket.on("updateNotifications", ({ type, notificationId }: UpdateNotificationsPayload) => {
        if (type === "markAsRead" && notificationId !== undefined) {
          setNotifications(prevNotifications => 
            prevNotifications.filter(n => n._id !== notificationId)
          );
        } else if (type === "clearAll") {
          setNotifications([]);
        }
      });
    }

    return () => {
      socket.off("newNotification");
      socket.off("updateNotifications");
    };
  }, [userInfo?.id]);

  const profileHandler = () => navigate("/profile");
  const logoutHandler = async () => {
    try {
      await dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCityClick = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);
  const handleCitySelect = (city: string) => {
    setCity(city);
    setShowModal(false);
  };

  const handleNotificationClick = async (id: number) => {
    try {
      console.log("Entering handleNotificationClick function with id:", id);
      const result = await markAsRead(id.toString()).unwrap();
      console.log("Notification marked as read:", result);
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n._id !== id)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearAllNotifications({}).unwrap();
      setNotifications([]);
      alert("All notifications cleared");
    } catch (err) {
      console.error(err);
    }
  };

  console.log("fetchedNotifications: ", fetchedNotifications);
  
  return (
    <header style={{ backgroundColor: "#3A5E49" }}>
      <Navbar collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                src="/logo.png"
                style={{ marginRight: "8px", width: "60px" }}
                alt="Ticket Hive Logo"
              />
              Ticket Hive
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <LinkContainer to="/">
                <Nav.Link className="nav-home">Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/allMovies">
                <Nav.Link className="nav-movies">Movies</Nav.Link>
              </LinkContainer>
            </Nav>

            <Nav className="ms-auto d-flex align-items-center">
              {userInfo && (
                <NotificationDropdown
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                  onClearAll={handleClearNotifications}
                />
              )}

              <Nav.Link className="city-info" onClick={handleCityClick}>
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  style={{ marginRight: "8px" }}
                />
                {city || profileData?.city || "Location not selected"}
              </Nav.Link>

              {userInfo ? (
                <NavDropdown
                  title={
                    <div
                      className="d-flex align-items-center"
                      style={{ marginLeft: "20px" }}
                    >
                      <img
                        src={
                          profileData?.profileImageName
                            ? `${PROFILE_IMAGE_DIR_PATH}${profileData.profileImageName}`
                            : DEFAULT_PROFILE_IMAGE
                        }
                        alt="User Avatar"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          marginRight: "10px",
                          objectFit: "cover",
                        }}
                      />
                      {userInfo.name}
                    </div>
                  }
                  id="username"
                  style={{ zIndex: 1050 }}
                  className="custom-dropdown"
                >
                  <NavDropdown.Item onClick={profileHandler}>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ marginRight: "8px" }}
                    />
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logoutHandler}>
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      style={{ marginRight: "8px" }}
                    />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link className="sign-in">Sign In</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/signup">
                    <Nav.Link className="sign-up">Sign Up</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {showModal && (
        <CitiesModal
          show={showModal}
          handleClose={handleModalClose}
          handleCitySelect={handleCitySelect}
        />
      )}
    </header>
  );
};

export default Header;

