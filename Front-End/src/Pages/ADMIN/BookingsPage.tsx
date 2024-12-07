import React, { useState, useEffect } from "react";
import { Button, Modal, Pagination, Table } from "react-bootstrap";
import { useGetBookingDetailsQuery } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import Loader from "../../Components/UserComponents/Loader";
import { FaInfoCircle } from "react-icons/fa";
import { BookingDetails } from "../../Types/BookingTypes";
import { useNavigate } from "react-router-dom";

interface Ticket {
  ticket: {
    bookingId: string;
    movieId: string;
    theaterName: string;
    screenName: string;
    seats: string[];
    bookingTime: string;
    paymentStatus: string;
    userName: string; // Add missing fields
    userEmail: string;
    images: string[];
    showTime: string;
    paymentMethod: string;
  };
  movieDetails: {
    poster: string; // Ensure this matches your actual data structure
  };
}

const AdminBookingDetailsScreen: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(6);

  const { data: bookings, isLoading, refetch } = useGetBookingDetailsQuery({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(
    null
  );

  console.log("bookings: ", bookings);

  useEffect(() => {
    document.title = "Admin Booking Details";
    refetch();
  }, [refetch]);

  const handleCloseBookingModal = () => {
    setSelectedBooking(null);
    setShowBookingModal(false);
  };

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

  console.log("transformedBookings: ", transformedBookings);

  return (
    <AdminLayout adminName="Admin">
      <div className="container mt-4">
        <h1 className="mb-4">Booking Details</h1>
        {transformedBookings.length === 0 ? (
          <p className="text-muted">No bookings available at the moment.</p>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className="text-center"
            style={{ tableLayout: "fixed", wordWrap: "break-word" }}
          >
            <thead className="table-dark">
              <tr>
                <th style={{ padding: "12px" }}>Booking ID</th>
                <th style={{ padding: "12px" }}>User</th>
                <th style={{ padding: "12px" }}>Theater</th>
                <th style={{ padding: "12px" }}>Payment Method</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking: BookingDetails) => (
                <tr key={booking.bookingId}>
                  <td style={{ padding: "10px" }}>{`${booking.bookingId.slice(
                    0,
                    6
                  )}...${booking.bookingId.slice(-4)}`}</td>
                  <td style={{ padding: "10px" }}>{booking.user.name}</td>
                  <td style={{ padding: "10px" }}>{booking.theater.name}</td>
                  <td style={{ padding: "10px" }}>{booking.paymentMethod}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      className={`badge ${
                        booking.status === "confirmed"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <Button
                      variant="info"
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
        )}

        {/* Pagination controls */}
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

        {/* Booking Details Modal */}
        <Modal show={showBookingModal} onHide={handleCloseBookingModal}>
          <Modal.Header closeButton>
            <Modal.Title>Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking ? (
              <div>
                <p>
                  <strong>Booking ID:</strong> {selectedBooking.bookingId}
                </p>
                <p>
                  <strong>User:</strong> {selectedBooking.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedBooking.user?.email}
                </p>
                <p>
                  <strong>Theater:</strong> {selectedBooking.theater?.name}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedBooking.paymentMethod}
                </p>
                <p>
                  <strong>Status:</strong> {selectedBooking.status}
                </p>
              </div>
            ) : (
              <p>No booking details available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseBookingModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingDetailsScreen;
