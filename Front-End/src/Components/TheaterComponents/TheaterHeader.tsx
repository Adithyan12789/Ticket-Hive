import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { useLogoutTheaterMutation } from '../../Slices/TheaterApiSlice';
import { clearTheater } from '../../Slices/TheaterAuthSlice';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../Store';

const TheaterOwnerHeader: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutTheaterMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearTheater());
      navigate('/theater-login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header style={{ backgroundColor: '#3A5E49' }}>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">

            <Nav className="ms-auto">
              {theaterInfo ? (
                <NavDropdown title={theaterInfo.name || theaterInfo.data.name} id="owner-username">
                  <NavDropdown.Item onClick={logoutHandler}>
                    <FaSignOutAlt /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/theater-login">
                  <Nav.Link>
                    <FaSignOutAlt /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default TheaterOwnerHeader;
