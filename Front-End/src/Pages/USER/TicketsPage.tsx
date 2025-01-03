import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Card,
  Alert,
  Pagination,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/UserComponents/Loader";
import { useSelector } from "react-redux";
import { useGetBookingDetailsQuery } from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";
import UserNavBar from "../../Components/UserComponents/UserNavBar";
import { MovieManagement } from "../../Types/MoviesTypes";
import { Ticket2 } from "../../Types/BookingTypes";
import "./TicketPage.css";

interface TicketEntry {
  movieDetails: MovieManagement;
  ticket: Ticket2;
}

const TicketsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const userId = userInfo?.id

  console.log("userId: ", userId);
  
  const { data, isLoading, refetch } = useGetBookingDetailsQuery(userId);
  const tickets: TicketEntry[] = data?.tickets || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("movieTitle");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    document.title = "Ticket Hive - Booking Details";
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredTickets =
    filterStatus === "all"
      ? tickets
      : tickets.filter(
          (ticket) => ticket.ticket.paymentStatus === filterStatus
        );

  const sortedTickets = [...filteredTickets].sort((b, a) => {
    if (sortBy === "movieTitle") {
      return a.movieDetails.title.localeCompare(b.movieDetails.title);
    } else {
      return (
        new Date(b.ticket.bookingTime).getTime() -
        new Date(a.ticket.bookingTime).getTime()
      );
    }
  });

  const totalTickets = sortedTickets.length;
  const totalPages = Math.ceil(totalTickets / itemsPerPage);

  const indexOfLastTicket = currentPage * itemsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - itemsPerPage;
  const currentTickets = sortedTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  if (loading || isLoading) return <Loader />;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  console.log("tickets: ", tickets);
  console.log("currentTickets: ", currentTickets);

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        marginTop: "30px",
      }}
    >
      <UserNavBar />

      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-4 text-center text-primary">Your Tickets</h3>
            <div className="d-flex justify-content-between mb-3">
              <DropdownButton
                id="dropdown-filter"
                variant="outline-secondary"
                title={`Filter by Status: ${
                  filterStatus === "all" ? "All" : filterStatus
                }`}
                onSelect={(status) => {
                  if (status) {
                    setFilterStatus(status);
                  }
                }}
              >
                <Dropdown.Item eventKey="all">All</Dropdown.Item>
                <Dropdown.Item eventKey="Confirmed">Confirmed</Dropdown.Item>
                <Dropdown.Item eventKey="pending">Pending</Dropdown.Item>
                <Dropdown.Item eventKey="cancelled">Cancelled</Dropdown.Item>
              </DropdownButton>

              <DropdownButton
                id="dropdown-sort"
                variant="outline-secondary"
                title={`Sort by: ${
                  sortBy === "movieTitle" ? "Movie Title" : "Booking Time"
                }`}
                onSelect={(sortOption) => {
                  if (sortOption) {
                    setSortBy(sortOption);
                  }
                }}
              >
                <Dropdown.Item eventKey="movieTitle">Movie Title</Dropdown.Item>
                <Dropdown.Item eventKey="bookingTime">
                  Booking Time
                </Dropdown.Item>
              </DropdownButton>
            </div>

            {tickets.length === 0 ? (
              <Alert
                variant="info"
                className="text-center p-4 shadow-sm rounded"
              >
                You have no bookings yet. Start exploring movies and book your
                tickets now!
              </Alert>
            ) : (
              <Table
                striped
                bordered
                hover
                responsive
                className="modern-table text-center my-3 py-3 shadow-lg rounded"
              >
                <thead className="table-dark text-uppercase">
                  <tr>
                    <th>Movie Title</th>
                    <th>Theater</th>
                    <th>Status</th>
                    <th>Booking ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTickets.map((ticketEntry) => (
                    <tr
                      key={ticketEntry.ticket.bookingId}
                      className={`${
                        ticketEntry.ticket.paymentStatus === "cancelled"
                          ? "bg-danger text-white"
                          : ticketEntry.ticket.paymentStatus === "Confirmed"
                          ? "bg-success text-white"
                          : ticketEntry.ticket.paymentStatus === "pending"
                          ? "bg-warning text-dark"
                          : ""
                      } modern-row`}
                    >
                      <td className="py-3 fw-bold">
                        {ticketEntry.movieDetails.title}
                      </td>
                      <td className="py-3">{ticketEntry.ticket.theaterName}</td>
                      <td className="py-3">
                        <span
                          className={`badge status-badge ${
                            ticketEntry.ticket.paymentStatus === "Confirmed"
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
                          className="modern-button"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages).keys()].map((pageNumber) => (
                <Pagination.Item
                  key={pageNumber + 1}
                  active={pageNumber + 1 === currentPage}
                  onClick={() => handlePageChange(pageNumber + 1)}
                >
                  {pageNumber + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TicketsScreen;
