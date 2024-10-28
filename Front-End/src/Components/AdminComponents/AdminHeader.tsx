import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useAdminLogoutMutation } from "../../Slices/AdminApiSlice";
import { logout } from "../../Slices/AdminAuthSlice";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../Store";
import "./AdminHeader.css"

const AdminHeader: React.FC = () => {
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [logoutApiCall] = useAdminLogoutMutation();

  const handleDashboardClick = () => {
    navigate("/admin/dashboard");
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header style={{ backgroundColor: "#3A5E49" }}>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="d-flex w-100 justify-content-between">
              <div className="d-flex justify-content-start w-50">
                {adminInfo && (
                  <Nav.Link
                    className="admin-dashboard-title pt-4 text-white"
                    onClick={handleDashboardClick}
                  >
                    <FaTachometerAlt /> Admin Dashboard
                  </Nav.Link>
                )}
              </div>
              
              <Nav className="ms-auto">
                {adminInfo ? (
                  <NavDropdown title={adminInfo.name} id="admin-username">
                    <NavDropdown.Item onClick={logoutHandler}>
                      <FaSignOutAlt /> Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <LinkContainer to="/admin-login">
                    <Nav.Link>
                      <FaSignOutAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>
                )}
              </Nav>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default AdminHeader;
