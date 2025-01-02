import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import QRCode from "react-qr-code";
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
import "./TicketDetailsPage.css";
import Footer from "../../Components/UserComponents/Footer";
import { backendUrl } from "../../url";

const USER_MOVIE_POSTER = `${backendUrl}/MoviePosters/`;

const TicketDetailsScreen: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetBookingDetailsQuery(userInfo?.id);
  const [cancelBooking] = useCancelBookingMutation();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const ticket = data?.tickets?.find(
    (t: { ticket: { bookingId: string | undefined } }) =>
      t.ticket.bookingId === bookingId
  );

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

  const handleCancel = async () => {
    try {
      await cancelBooking(ticket?.ticket.bookingId).unwrap();
      toast.success("Ticket cancelled successfully!");
      setShowModal(false);
      navigate("/tickets");
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel the ticket. Please try again later.");
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

  console.log("tikcet: ", ticket);
  

  return (
    <>
      <Container className="mt-5">
        <Card className="shadow-lg border-0 p-4 rounded-4 modern-card">
          <Row>
            <Col md={4} className="text-center">
              <div className="poster-wrapper">
                <Card.Img
                  src={
                    ticket.movieDetails.poster
                      ? `${USER_MOVIE_POSTER}${ticket.movieDetails.poster}`
                      : "/placeholder-image.png"
                  }
                  alt={ticket.movieDetails.title || "Movie Poster"}
                  className="img-fluid rounded-3"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </Col>
            <Col md={8}>
              <Card.Body>
                <h2 className="mb-4 text-gradient fw-bold">
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
                      <strong>Screen:</strong>{" "}
                      {ticket.ticket.screenName || "N/A"}
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
                      <strong>Status:</strong>
                      <div className="status-bar-container">
                        <div
                          className={`status-bar ${
                            ticket.ticket.paymentStatus === "pending"
                              ? "status-bar-pending"
                              : ticket.ticket.paymentStatus === "cancelled"
                              ? "status-bar-cancelled"
                              : "status-bar-completed"
                          }`}
                        >
                          {ticket.ticket.paymentStatus || "N/A"}
                        </div>
                      </div>
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
                  <div className="qr-code-wrapper mt-3">
                    <QRCode
                      value={ticket.ticket.bookingId || "N/A"}
                      size={128}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="outline-primary"
                    className="me-3 modern-button"
                    onClick={() => navigate("/tickets")}
                  >
                    Back to Tickets
                  </Button>
                  {ticket.ticket.paymentStatus !== "Confirmed" && (
                    <Button
                      variant="danger"
                      className="me-3 modern-button"
                      onClick={() => setShowModal(true)}
                      disabled={ticket.ticket.paymentStatus === "cancelled"}
                    >
                      Cancel Ticket
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>

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
      <Footer />
    </>
  );
};

export default TicketDetailsScreen;
