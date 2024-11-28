import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import QRCode from "react-qr-code"; // For generating QR codes
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";
import {
  useGetBookingDetailsQuery,
  useCancelBookingMutation,
} from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";
import {
  FaFilm,
  FaTheaterMasks,
  FaChair,
  FaClock,
  FaIdBadge,
  FaQrcode,
} from "react-icons/fa";
import { MovieManagement } from "../../Types/MoviesTypes";
import { Ticket } from "../../Types/BookingTypes";

const USER_MOVIE_POSTER = "http://localhost:5000/MoviePosters/";

interface TicketEntry {
  movieDetails: MovieManagement;
  ticket: Ticket;
}

const TicketDetailsScreen: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetBookingDetailsQuery(userInfo?.id);
  const [cancelBooking] = useCancelBookingMutation();

  const [showModal, setShowModal] = useState(false);

  const ticket = data?.tickets?.find(
    (t: TicketEntry) => t.ticket.bookingId === bookingId
  );

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Ticket Details - ${
      ticket?.movieDetails.title || "Not Found"
    }`;
  }, [ticket]);

  console.log("ticket bookingId: ", ticket?.ticket.bookingId);

  const handleCancel = async () => {
    try {
      await cancelBooking(ticket?.ticket.bookingId).unwrap();
      toast.success("Ticket cancelled successfully!");
      setShowModal(false);
      navigate("/tickets");
    } catch (error) {
      console.error("Cancel booking error:", error); // Log the error for debugging
      toast.error("Failed to cancel the ticket. Please try again later."); // Pass a single argument
    }
  };

  if (loading || isLoading) return <Loader />;
  if (!ticket) {
    return (
      <Container>
        <h3 className="text-danger mt-5">Ticket not found!</h3>
        <Button
          variant="outline-primary"
          className="mt-3"
          onClick={() => navigate("/tickets")}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card className="shadow border-0 p-4 rounded-4">
        <Row>
          <Col md={4} className="text-center">
            <Card.Img
              src={
                ticket.movieDetails.poster
                  ? `${USER_MOVIE_POSTER}${ticket.movieDetails.poster}`
                  : "/placeholder-image.png" // Provide a fallback image
              }
              alt={ticket.movieDetails.title || "Movie Poster"}
              className="img-fluid rounded-3"
              style={{ objectFit: "cover" }}
            />
          </Col>
          <Col md={8}>
            <Card.Body>
              <h2 className="mb-4 text-primary fw-bold">
                <FaFilm className="me-2" />
                {ticket.movieDetails.title || "Untitled Movie"}
              </h2>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Genre:</strong>{" "}
                    {ticket.movieDetails.genre.join(", ") || "N/A"}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {ticket.movieDetails.duration || "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <FaTheaterMasks className="me-2 text-secondary" />
                    <strong>Theater:</strong>{" "}
                    {ticket.ticket.theaterName || "N/A"}
                  </p>
                  <p>
                    <strong>Screen:</strong> {ticket.ticket.screenName || "N/A"}
                  </p>
                </Col>
              </Row>

              <h5 className="text-muted mt-4 mb-3">Ticket Details</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <p>
                    <FaChair className="me-2 text-secondary" />
                    <strong>Seats:</strong>{" "}
                    {ticket.ticket.seats.join(", ") || "N/A"}
                  </p>
                  <p>
                    <FaClock className="me-2 text-secondary" />
                    <strong>Booking Date and Time:</strong>{" "}
                    {new Date(ticket.ticket.bookingDate).toLocaleString() ||
                      "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        ticket.ticket.paymentStatus === "Confirmed"
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {ticket.ticket.paymentStatus || "N/A"}
                    </span>
                  </p>
                  <p>
                    <FaIdBadge className="me-2 text-secondary" />
                    <strong>Booking ID:</strong>{" "}
                    {ticket.ticket.bookingId || "N/A"}
                  </p>
                </Col>
              </Row>

              <div className="mt-4">
                <h6>
                  <FaQrcode className="me-2 text-primary" />
                  Scan QR Code for Ticket Verification
                </h6>
                <QRCode
                  value={ticket.ticket.bookingId || "N/A"}
                  size={128}
                  className="mt-3"
                />
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="outline-primary"
                  className="me-3"
                  onClick={() => navigate("/tickets")}
                >
                  Back to Tickets
                </Button>
                <Button
                  variant="danger"
                  className="me-3"
                  onClick={() => setShowModal(true)}
                  disabled={ticket.ticket.paymentStatus === "cancelled"} // Disable button if the ticket is cancelled
                >
                  Cancel Ticket
                </Button>

                {/* <Button variant="primary">Download Ticket</Button> */}
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this ticket? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Confirm Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TicketDetailsScreen;
