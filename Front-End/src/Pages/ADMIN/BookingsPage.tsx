  import React, { useState, useEffect } from "react";
  import { Button, Pagination, Table } from "react-bootstrap";
  import { useGetBookingDetailsQuery } from "../../Slices/AdminApiSlice";
  import AdminLayout from "../../Components/AdminComponents/AdminLayout";
  import Loader from "../../Components/UserComponents/Loader";
  import { FaInfoCircle } from "react-icons/fa";
  import { BookingDetails } from "../../Types/BookingTypes";
  import { useNavigate } from "react-router-dom";
  import "./BookingPage.css"; // Add a custom CSS file for additional styling

  export interface Ticket {
    ticket: {
      bookingId: string;
      movieId: string;
      theaterName: string;
      screenName: string;
      seats: string[];
      bookingTime: string;
      paymentStatus: string;
      userName: string;
      userEmail: string;
      images: string[];
      showTime: string;
      paymentMethod: string;
    };
    movieDetails: {
      poster: string;
    };
  }

  const BookingDetailsScreen: React.FC = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(6);

    const { data: bookings, isLoading, refetch } = useGetBookingDetailsQuery({});

    useEffect(() => {
      document.title = "Admin Booking Details";
      refetch();
    }, [refetch]);

    const transformedBookings =
      bookings?.tickets?.map((ticket: Ticket) => ({
        bookingId: ticket.ticket.bookingId,
        user: {
          name: ticket.ticket.userName,
          email: ticket.ticket.userEmail,
        },
        theater: { name: ticket.ticket.theaterName },
        poster: ticket.movieDetails.poster,
        images: ticket.ticket.images,
        showTime: ticket.ticket.showTime,
        paymentMethod: ticket.ticket.paymentMethod,
        seats: ticket.ticket.seats || [],
        status: ticket.ticket.paymentStatus || "Unknown",
      })) || [];

    const totalPages = Math.ceil(transformedBookings.length / bookingsPerPage);

    const paginatedBookings = transformedBookings.slice(
      (currentPage - 1) * bookingsPerPage,
      currentPage * bookingsPerPage
    );

    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
      refetch();
    };

    if (isLoading) return <Loader />;

    return (
      <AdminLayout adminName="Admin">
        <div className="container mt-4">
          <h1 className="mb-4 text-center">Booking Details</h1>
          {transformedBookings.length === 0 ? (
            <p className="text-muted text-center">No bookings available at the moment.</p>
          ) : (
            <div className="table-responsive">
              <Table className="modern-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Theater</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking: BookingDetails) => (
                    <tr key={booking.bookingId}>
                      <td>{`${booking.bookingId.slice(0, 6)}...${booking.bookingId.slice(-4)}`}</td>
                      <td>{booking.user.name}</td>
                      <td>{booking.theater.name}</td>
                      <td>{booking.paymentMethod}</td>
                      <td>
                        <span
                          className={`badge ${
                            booking.status === "confirmed"
                              ? "status-confirmed"
                              : "status-pending"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`${booking.bookingId}`)}
                        >
                          <FaInfoCircle className="me-2" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          <Pagination className="justify-content-center mt-4">
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
        </div>
      </AdminLayout>
    );
  };

  export default BookingDetailsScreen;
