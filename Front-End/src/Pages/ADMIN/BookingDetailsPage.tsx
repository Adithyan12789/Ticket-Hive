import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetBookingDetailsQuery,
  useUpdateBookingStatusMutation,
} from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import Loader from "../../Components/UserComponents/Loader";
import { Ticket } from "../../Types/BookingTypes";
import Swal from "sweetalert2";  // Import SweetAlert2

const AdminBookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: bookings, isLoading } = useGetBookingDetailsQuery({});
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [status, setStatus] = useState<string>("");

  const selectedBooking = bookings?.tickets?.find(
    (ticket: Ticket) => ticket.ticket.bookingId === bookingId
  );

  useEffect(() => {
    document.title = "Booking Details - Admin";
  }, []);

  if (isLoading) return <Loader />;

  if (!selectedBooking) {
    return (
      <AdminLayout adminName="Admin">
        <div className="container mt-5 text-center">
          <h1 className="text-danger">Booking Not Found</h1>
          <Link to="/admin/bookings" className="btn btn-outline-primary mt-4">
            Go Back to Bookings
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const ticket = selectedBooking.ticket;
  const movieDetails = selectedBooking.movieDetails;

  const handleStatusChange = async (newStatus: string) => {
    // Show SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to update the booking status to ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setStatus(newStatus);  // Update the state with the new status
      await updateBookingStatus({
        bookingId: ticket.bookingId,
        status: newStatus,
      });
      Swal.fire('Updated!', `Booking status has been updated to ${newStatus}.`, 'success');
    }
  };

  const BACKDROP_BASE_URL = "http://localhost:5000/TheatersImages/";
  const MOVIE_IMAGES_DIR_PATH = "http://localhost:5000/MoviePosters/";

  return (
    <AdminLayout adminName="Admin">
      <div className="container">
        {/* Back to Booking List Button */}
        <div className="mt-4 text-center">
          <Link to="/admin/bookings" className="btn btn-outline-primary" style={{textDecoration: "none"}}>
            Back to Booking List
          </Link>
        </div>

        <h1 className="mb-4 text-center text-uppercase">Booking Details</h1>

        {/* User Details */}
        <div className="card p-4 shadow-lg rounded-4 mb-4">
          <h4 className="text-primary mb-3">User Information</h4>
          <ul className="list-group">
            <li className="list-group-item">
              <strong>Name:</strong> {ticket.userName}
            </li>
            <li className="list-group-item">
              <strong>Email:</strong> {ticket.userEmail}
            </li>
          </ul>
        </div>

        {/* Theater Details */}
        <div className="card p-4 shadow-lg rounded-4 mb-4">
          <h4 className="text-primary mb-3">Theater Information</h4>
          <ul className="list-group">
            <li className="list-group-item">
              <strong>Theater Name:</strong> {ticket.theaterName}
            </li>
            <li className="list-group-item">
              <strong>Images:</strong>
              <div className="mt-2">
                {ticket.images && ticket.images.length > 0 ? (
                  <div className="d-flex flex-wrap">
                    {ticket.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={`${BACKDROP_BASE_URL}${image}`}
                        alt={`Theater Image ${index + 1}`}
                        className="img-thumbnail me-2 mb-2"
                        style={{
                          maxWidth: "150px",
                          maxHeight: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src="https://via.placeholder.com/150x150?text=No+Image"
                    alt="No images available"
                    className="img-thumbnail me-2 mb-2"
                    style={{
                      maxWidth: "150px",
                      maxHeight: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                )}
              </div>
            </li>
          </ul>
        </div>

        {/* Ticket Details - Side by Side */}
        <div className="card p-4 shadow-lg rounded-4">
          <h4 className="text-primary mb-3">Ticket Information</h4>

          <div className="d-flex align-items-start">
            {/* Movie Poster */}
            <div className="me-4">
              <img
                src={`${MOVIE_IMAGES_DIR_PATH}${movieDetails.poster}`}
                alt="Movie Poster"
                className="img-fluid rounded-4"
                style={{
                  maxWidth: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </div>

            {/* Ticket Details */}
            <div className="flex-grow-1">
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>Booking ID:</strong> {ticket.bookingId}
                </li>
                <li className="list-group-item">
                  <strong>Seats:</strong> {ticket.seats?.join(", ") || "No seats"}
                </li>
                <li className="list-group-item">
                  <strong>Show Time:</strong> {ticket.showTime}
                </li>
                <li className="list-group-item">
                  <strong>Status:</strong>
                  <span className="badge bg-info ms-2">
                    {ticket.paymentStatus || "Unknown"}
                  </span>
                </li>
              </ul>

              {/* Status Change Dropdown */}
              <div className="mt-4">
                <label htmlFor="statusSelect" className="form-label">
                  Update Booking Status
                </label>
                <select
                  id="statusSelect"
                  value={status || ticket.paymentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="form-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingDetailPage;
