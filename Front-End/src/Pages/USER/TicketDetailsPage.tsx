import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Loader from "../../Components/UserComponents/Loader";
import { useGetBookingDetailsQuery } from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";

const USER_MOVIE_POSTER = "http://localhost:5000/MoviePosters/";

// Define the MovieDetails and Ticket interfaces
interface MovieDetails {
  title: string;
  poster: string;
  duration: string;
  genre: string[];
}

interface Ticket {
  bookingId: string;
  movieId: string;
  theaterName: string;
  screenName: string;
  seats: string[];
  bookingTime: string;
  paymentStatus: string;
}

interface TicketEntry {
  movieDetails: MovieDetails;
  ticket: Ticket;
}

const TicketDetailsScreen: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetBookingDetailsQuery(userInfo?.id);

  // Find the specific ticket
  const ticket = data?.tickets?.find(
    (t: TicketEntry) => t.ticket.bookingId === bookingId
  );

  useEffect(() => {
    document.title = `Ticket Details - ${ticket?.movieDetails.title || ""}`;
  }, [ticket]);

  if (isLoading) return <Loader />;
  if (!ticket) {
    return (
      <Container>
        <h3 className="text-danger mt-5">Ticket not found!</h3>
        <Button onClick={() => navigate("/tickets")}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow border-0 p-4">
        <Row>
          <Col md={4}>
            <Card.Img
              src={`${USER_MOVIE_POSTER}${ticket.movieDetails.poster}`}
              alt={ticket.movieDetails.title}
              className="img-fluid"
            />
          </Col>
          <Col md={8}>
            <Card.Body>
              <h3>{ticket.movieDetails.title}</h3>
              <p>
                <strong>Genre:</strong> {ticket.movieDetails.genre.join(", ")}
                <br />
                <strong>Duration:</strong> {ticket.movieDetails.duration}
              </p>
              <p>
                <strong>Theater:</strong> {ticket.ticket.theaterName}
                <br />
                <strong>Screen:</strong> {ticket.ticket.screenName}
                <br />
                <strong>Seats:</strong> {ticket.ticket.seats.join(", ")}
                <br />
                <strong>Booking Date and Time:</strong>{" "}
                {new Date(ticket.ticket.bookingDate).toLocaleString()}
                <br />
                <strong>Status:</strong> {ticket.ticket.paymentStatus}
                <br />
                <strong>Booking ID:</strong> {ticket.ticket.bookingId}
              </p>
              <Button variant="primary" onClick={() => navigate("/tickets")}>
                Back to Tickets
              </Button>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default TicketDetailsScreen;
