import { useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/UserComponents/Loader";
import { useSelector } from "react-redux";
import { useGetBookingDetailsQuery } from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";
import UserProfileSidebar from "../../Components/UserComponents/UserSideBar";

interface MovieDetails {
  title: string;
  poster: string;
  duration: string;
  genre: string[];
}

interface Ticket {
  bookingId: string;
  movieId: string;
  movieTitle: string;
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

const TicketsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const { data, isLoading } = useGetBookingDetailsQuery(userInfo?.id);

  const tickets: TicketEntry[] = data?.tickets || [];

  console.log("tickets: ", tickets);
  

  useEffect(() => {
    document.title = "Ticket Hive - Booking Details";
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div style={{ padding: "20px" }}>
      <Container fluid>
        <Row className="my-4">
          {/* Sidebar */}
          <Col md={3}>
            <UserProfileSidebar />
          </Col>

          {/* Main content */}
          <Col md={9}>
            <h3 className="mb-4">Your Tickets</h3>
            {/* Table Layout */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Movie Title</th>
                  <th>Theater</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Booking ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticketEntry) => (
                  <tr key={ticketEntry.ticket.bookingId}>
                    <td>{ticketEntry.movieDetails.title}</td>
                    <td>{ticketEntry.ticket.theaterName}</td>
                    <td>{ticketEntry.ticket.seats.join(", ")}</td>
                    <td>{ticketEntry.ticket.paymentStatus}</td>
                    <td>{ticketEntry.ticket.bookingId}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          navigate(`/ticket/${ticketEntry.ticket.bookingId}`)
                        }
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TicketsScreen;
