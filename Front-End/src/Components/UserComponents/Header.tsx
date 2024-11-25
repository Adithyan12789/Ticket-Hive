import React, { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import {
  useGetUserProfileQuery,
  useLogoutMutation,
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

const Header: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: profileData } = useGetUserProfileQuery(userInfo?.id);
  const [logoutApiCall] = useLogoutMutation();

  const [city, setCity] = useState<string>("");

  const profileHandler = () => {
    if (userInfo && profileData) {
      navigate("/profile");
    } else {
      console.error("Profile data not available");
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const [showModal, setShowModal] = useState(false);

  console.log("profileData: ", profileData);

  const handleCityClick = () => {
    console.log("Opening modal...");
    setShowModal(true);
  };

  const handleModalClose = () => {
    console.log("Closing modal...");
    setShowModal(false);
  };

  const handleCitySelect = (city: string) => {
    setCity(city); // Set the new city and trigger re-render
    setShowModal(false); // Close the modal
  };

  return (
    <header style={{ backgroundColor: "#3A5E49" }}>
      <Navbar collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                src="/stock-vector-icon-logo-illustration-for-digital-business-ticket-services-720686734-removebg-preview.png"
                style={{ marginRight: "8px", width: "60px" }}
              />{" "}
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

            <Nav className="ms-auto">
              <Nav.Link className="city-info" onClick={handleCityClick}>
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  style={{ marginRight: "8px" }}
                />
                {city || profileData?.city || "Location not selected"}
              </Nav.Link>

              {userInfo ? (
                <NavDropdown
                  title={userInfo.name || userInfo.data.name}
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
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link className="sign-in">
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>

                  <LinkContainer to="/signup">
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
