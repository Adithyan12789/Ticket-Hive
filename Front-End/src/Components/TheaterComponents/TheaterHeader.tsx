import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import {
  useGetTheaterOwnerProfileQuery,
  useLogoutTheaterMutation,
} from "../../Slices/TheaterApiSlice";
import { clearTheater } from "../../Slices/TheaterAuthSlice";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../Store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "./TheaterHeader.css";

const Header: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  console.log("theaterInfo: ", theaterInfo);

  const { data: profileData } = useGetTheaterOwnerProfileQuery(
    theaterInfo?.id
  );

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
                style={{ marginRight: "8px", width: "60px" }}
              />{" "}
              Ticket Hive
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {theaterInfo ? (
                <>
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
    </header>
  );
};

export default Header;
