import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FaUser, FaCalendarAlt, FaWallet, FaSignOutAlt } from "react-icons/fa";
import "./UserNavBar.css"
import { AppDispatch, RootState } from "../../Store";
import { useDispatch, useSelector } from "react-redux";
import {
  useLogoutMutation,
} from "../../Slices/UserApiSlice";
import { logout } from "../../Slices/AuthSlice";

const UserProfileNavbar: React.FC = () => {
  const location = useLocation();

  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  console.log("userInfo: ", userInfo);

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Navbar
      bg="light"
      expand="lg"
      sticky="top"
      className="user-navbar shadow-sm"
    >
      <Container>
        {/* Navbar Collapse */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto text-center">
            {/* My Profile */}
            <Nav.Link
              as={Link}
              to="/profile"
              className={`t-user-navbar-link ${
                location.pathname === "/profile"
              }`}
            >
              <FaUser className="t-user-navbar-icon" /> My Profile
            </Nav.Link>

            {/* Booking Details */}
            <Nav.Link
              as={Link}
              to="/tickets"
              className={`t-user-navbar-link ${
                location.pathname === "/tickets"
              }`}
            >
              <FaCalendarAlt className="t-user-navbar-icon" /> Booking Details
            </Nav.Link>

            {/* Wallet */}
            <Nav.Link
              as={Link}
              to="/wallet"
              className={`t-user-navbar-link ${
                location.pathname === "/wallet"
              }`}
            >
              <FaWallet className="t-user-navbar-icon" /> Wallet
            </Nav.Link>

            {/* Logout */}
            <Nav.Link
              onClick={logoutHandler}
              className="t-user-navbar-link text-danger"
            >
              <FaSignOutAlt className="t-user-navbar-icon" /> Log Out
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserProfileNavbar;
