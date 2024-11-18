import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../../Slices/AuthSlice";
import { useGetBookingDetailsQuery, useCancelBookingMutation } from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";
import UserProfileSidebar from "../../Components/UserComponents/UserSideBar";

// Define types for the booking data
interface User {
  name: string;
}

interface Booking {
  _id: string;
  user: User;
  movie: { title: string };
  seats: string[];
  bookingTime: string;
  status: string;
}

const BookingDetailsScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth) || {
    userInfo: null,
  };

  const { data: bookingDetails, isLoading, refetch } = useGetBookingDetailsQuery(userInfo?.id);

  const [cancelBooking, { isLoading: canceling }] = useCancelBookingMutation();

  useEffect(() => {
    document.title = "Ticket Hive - Booking Details";
  }, []);

  const cancelBookingHandler = async () => {
    try {
      if (!bookingId) return;

      const response = await cancelBooking(bookingId).unwrap();
      await refetch();

      dispatch(setCredentials(response));

      toast.success("Booking Cancelled Successfully");

      navigate("/booking-details");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "An error occurred");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div style={{ padding: "20px" }}>
      <Container fluid>
        <Row className="my-4 justify-content-center">
          {/* Sidebar */}
          <Col md={3}>
            <UserProfileSidebar />
          </Col>

          {/* Main content */}
          <Col md={9}>
            <h3>Booking Details</h3>
            <Table striped bordered hover style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Movie</th>
                  <th>Seats</th>
                  <th>Booking Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookingDetails?.map((booking: Booking) => (
                  <tr key={booking._id}>
                    <td>{booking._id}</td>
                    <td>{booking.user.name}</td>
                    <td>{booking.movie.title}</td>
                    <td>{booking.seats.join(", ")}</td>
                    <td>{new Date(booking.bookingTime).toLocaleString()}</td>
                    <td>{booking.status}</td>
                    <td>
                      {booking.status !== "Cancelled" && (
                        <Button
                          variant="danger"
                          onClick={() => {
                            setShowModal(true);
                            setBookingId(booking._id);
                          }}
                          style={{
                            padding: "5px 10px",
                            fontSize: "14px",
                          }}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>

      {/* Cancel Booking Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this booking?</p>
          <Button
            variant="danger"
            onClick={cancelBookingHandler}
            disabled={canceling}
            style={{ marginRight: "10px" }}
          >
            {canceling ? <Loader /> : "Yes, Cancel"}
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            No, Keep Booking
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BookingDetailsScreen;
