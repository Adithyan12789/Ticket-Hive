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
import { faCaretDown, faMapMarkerAlt, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import CitiesModal from "./CitiesModal";
import { NotificationDropdown } from "../UserComponents/NotificationDropdown";
import io from "socket.io-client";
import { backendUrl } from "../../url";

const PROFILE_IMAGE_DIR_PATH = `${backendUrl}/UserProfileImages/`;
const DEFAULT_PROFILE_IMAGE = "/profileImage_1729749713837.jpg";

const socket = io("https://api.tickethive.fun");

interface Notification {
  _id: number;
  message: string;
  createdAt: string;
}

interface UpdateNotificationsPayload {
  type: "markAsRead" | "clearAll";
  notificationId?: number;
}

const Header: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: profileData } = useGetUserProfileQuery(userInfo?.id);
  const { data: fetchedNotifications = [] } = useFetchUnreadNotificationsQuery(
    {}
  ) as {
    data: Notification[];
  };
  const [clearAllNotifications] = useClearAllNotificationsMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>(fetchedNotifications || []);

  useEffect(() => {
    setNotifications(fetchedNotifications);
  }, [fetchedNotifications]);

  useEffect(() => {
    if (userInfo?.id) {
      socket.emit("joinNotifications", { userId: userInfo.id });
  
      const handleNewNotification = (notification: Notification) => {
        console.log("Real-time: New notification received:", notification);
        setNotifications((prevNotifications) => [
          notification,
          ...prevNotifications,
        ]);
      };
  
      const handleUpdateNotifications = ({
        type,
        notificationId,
      }: UpdateNotificationsPayload) => {
        if (type === "markAsRead" && notificationId !== undefined) {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n._id !== notificationId)
          );
        } else if (type === "clearAll") {
          setNotifications([]);
        }
      };
  
      socket.on("newNotification", handleNewNotification);
      socket.on("updateNotifications", handleUpdateNotifications);
  
      return () => {
        socket.off("newNotification", handleNewNotification);
        socket.off("updateNotifications", handleUpdateNotifications);
      };
    }
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
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== id)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearAllNotifications({}).unwrap();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  console.log("userInfo: ", userInfo);
  
  return (
    <header style={{ backgroundColor: "#3A5E49" }}>
      <Navbar collapseOnSelect expand="lg" className="px-3 py-2">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <img
                src="/logo.png"
                alt="Ticket Hive Logo"
                className="me-2"
                style={{ width: "50px" }}
              />
              <span className="text-light">Ticket Hive</span>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <LinkContainer to="/">
                <Nav.Link className="text-light">Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/allMovies">
                <Nav.Link className="text-light">Movies</Nav.Link>
              </LinkContainer>
            </Nav>

            <Nav className="ms-auto d-flex align-items-center">
              {userInfo && (
                <div className="me-3">
                  <NotificationDropdown
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onClearAll={handleClearNotifications}
                  />
                </div>
              )}

              <Nav.Link
                className="text-light d-flex align-items-center me-3"
                onClick={handleCityClick}
              >
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="me-2"
                  size="lg"
                />
                {city || profileData?.city || "Select Location"}
              </Nav.Link>

              {userInfo ? (
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          profileData?.profileImageName
                            ? `${PROFILE_IMAGE_DIR_PATH}${profileData.profileImageName}`
                            : DEFAULT_PROFILE_IMAGE
                        }
                        alt="User Avatar"
                        className="rounded-circle me-2"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                      />
                      <span className="text-light me-2">{userInfo.name || userInfo.data.name}</span>
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className="text-light"
                      />
                    </div>
                  }
                  id="username"
                  className="text-light"
                >
                  <NavDropdown.Item onClick={profileHandler}>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logoutHandler}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link className="text-light me-3">Sign In</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/signup">
                    <Nav.Link className="text-light">Sign Up</Nav.Link>
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
