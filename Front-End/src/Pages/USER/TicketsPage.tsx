import { useEffect } from "react";
import { Container, Table, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/UserComponents/Loader";
import { useSelector } from "react-redux";
import { useGetBookingDetailsQuery } from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";
import UserNavBar from "../../Components/UserComponents/UserNavBar";

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

  useEffect(() => {
    document.title = "Ticket Hive - Booking Details";
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        marginTop: "30px",
      }}
    >
      {/* User Navigation Bar */}
      <UserNavBar />

      {/* Main Content */}
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-4 text-center text-primary">Your Tickets</h3>

            {tickets.length === 0 ? (
              <Alert variant="info" className="text-center">
                You have no bookings yet. Start exploring movies and book your
                tickets now!
              </Alert>
            ) : (
              <Table
                striped
                bordered
                hover
                responsive
                className="text-center my-3 py-3"
              >
                <thead className="table-dark">
                  <tr>
                    <th>Movie Title</th>
                    <th>Theater</th>
                    <th>Status</th>
                    <th>Booking ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticketEntry) => (
                    <tr
                      key={ticketEntry.ticket.bookingId}
                      className={`${
                        ticketEntry.ticket.paymentStatus === "cancelled"
                          ? "bg-danger text-white"
                          : ticketEntry.ticket.paymentStatus === "completed"
                          ? "bg-success text-white"
                          : ticketEntry.ticket.paymentStatus === "pending"
                          ? "bg-warning text-dark"
                          : ""
                      }`}
                    >
                      <td className="py-3">{ticketEntry.movieDetails.title}</td>
                      <td className="py-3">{ticketEntry.ticket.theaterName}</td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            ticketEntry.ticket.paymentStatus === "completed"
                              ? "bg-success"
                              : ticketEntry.ticket.paymentStatus === "cancelled"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {ticketEntry.ticket.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">{ticketEntry.ticket.bookingId}</td>
                      <td className="py-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/ticket/${ticketEntry.ticket.bookingId}`)
                          }
                          aria-label={`View details for booking ID ${ticketEntry.ticket.bookingId}`}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TicketsScreen;
