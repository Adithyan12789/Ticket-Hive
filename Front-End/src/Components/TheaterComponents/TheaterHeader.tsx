import React, { useEffect, useState, useRef } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import {
  useGetTheaterOwnerProfileQuery,
  useLogoutTheaterMutation,
  useFetchUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "../../Slices/TheaterApiSlice";
import { clearTheater } from "../../Slices/TheaterAuthSlice";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../Store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

const Header: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: profileData } = useGetTheaterOwnerProfileQuery(theaterInfo?.id);
  const { data: notifications = [], refetch } = useFetchUnreadNotificationsQuery({});
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [showNotifications, setShowNotifications] = useState(false);

  console.log("notifications: ", notifications);
  console.log("markNotificationAsRead: ", markNotificationAsRead);
  

  const handleNotificationClick = async (id: string) => {
    try {
      await markNotificationAsRead(id).unwrap();
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const handleIconClick = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
        try {
          await Promise.all(
            notifications.map((notification: Notification) =>
              markNotificationAsRead(notification._id).unwrap()
            )
          );
          refetch();
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, notifications, markNotificationAsRead, refetch]);

  useEffect(() => {
    socket.on("newNotification", () => {
      refetch();
    });

    return () => {
      socket.off("newNotification");
    };
  }, [refetch]);

  const [logoutApiCall] = useLogoutTheaterMutation();

  const profileHandler = () => {
    if (theaterInfo && profileData) {
      navigate("/theater-profile");
    } else {
      console.error("Profile data not available");
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearTheater());
      navigate("/theater");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header style={{ backgroundColor: "#3A5E49" }}>
      <Navbar collapseOnSelect>
        <Container>
          <LinkContainer to="/theater">
            <Navbar.Brand className="brand">
              <img
                src="/stock-vector-icon-logo-illustration-for-digital-business-ticket-services-720686734-removebg-preview.png"
                style={{ marginLeft: "200px", width: "60px" }}
                alt="Ticket Hive Logo"
              />
              Ticket Hive
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {theaterInfo ? (
                <>
                  <div className="notification-container" style={{ position: "relative", display: "inline-block" }}>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{
                        color: showNotifications ? "#36a2eb" : "white",
                        cursor: "pointer",
                        marginTop: "10px",
                        marginRight: "20px",
                        fontSize: "23px",
                      }}
                      onClick={handleIconClick}
                    />
                    {notifications.length > 0 && (
                      <span
                        className="notification-count"
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "15px",
                          background: "red",
                          color: "white",
                          fontSize: "12px",
                          padding: "2px 6px",
                          borderRadius: "50%",
                        }}
                      >
                        {notifications.length}
                      </span>
                    )}
                  </div>

                  {showNotifications && (
                    <div
                      className="notification-dropdown"
                      ref={dropdownRef}
                      style={{
                        position: "absolute",
                        top: "70px",
                        right: "165px",
                        backgroundColor: "#333",
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        zIndex: 1000,
                      }}
                    >
                      {notifications.map((notification: Notification) => (
                        <div
                          key={notification._id}
                          className="notification-item"
                          style={{
                            padding: "8px 10px",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease, color 0.3s ease",
                            color: "white",
                          }}
                          onClick={() => handleNotificationClick(notification._id)}
                        >
                          {notification.message}
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="no-notifications" style={{ textAlign: "center", fontSize: "14px", padding: "10px" }}>
                          No new notifications
                        </p>
                      )}
                    </div>
                  )}

                  <NavDropdown
                    title={theaterInfo.name || theaterInfo.data.name}
                    id="username"
                  >
                    <NavDropdown.Item
                      onClick={profileHandler}
                      className="dropdown-item"
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        style={{ marginRight: "8px" }}
                      />
                      Profile
                    </NavDropdown.Item>

                    <NavDropdown.Item
                      onClick={logoutHandler}
                      className="dropdown-item"
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        style={{ marginRight: "8px" }}
                      />
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/theater-login">
                    <Nav.Link className="sign-in">
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>

                  <LinkContainer to="/theater-signup">
                    <Nav.Link className="sign-up">
                      <FaSignOutAlt /> Sign Up
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
