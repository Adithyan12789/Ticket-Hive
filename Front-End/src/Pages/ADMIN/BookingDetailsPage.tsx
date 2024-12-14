import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetBookingDetailsQuery,
  useUpdateBookingStatusMutation,
} from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import Loader from "../../Components/UserComponents/Loader";
import { Ticket } from "./BookingsPage";
import Swal from "sweetalert2";

const AdminBookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data: bookings, isLoading } = useGetBookingDetailsQuery({});
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [status, setStatus] = useState<string>("");

  const selectedBooking = bookings?.tickets?.find(
    (ticket: Ticket) => ticket.ticket.bookingId === bookingId
  );

  console.log("selectedBooking: ", selectedBooking);

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
  const offerDetails = selectedBooking.offerDetails;

  const handleStatusChange = async (newStatus: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to update the booking status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setStatus(newStatus);
      await updateBookingStatus({
        bookingId: ticket.bookingId,
        status: newStatus,
      });
      Swal.fire(
        "Updated!",
        `Booking status has been updated to ${newStatus}.`,
        "success"
      );
    }
  };

  const BACKDROP_BASE_URL = "http://localhost:5000/TheatersImages/";
  const MOVIE_IMAGES_DIR_PATH = "http://localhost:5000/MoviePosters/";

  return (
    <AdminLayout adminName="Admin">
      <div className="container mt-4">
        <h1 className="mb-4 text-center text-uppercase">Booking Details</h1>

        {/* Booking Detail Card */}
        <div className="card p-4 shadow-lg rounded-4">
          <div className="row mb-4">
            {/* User and Theater Info */}
            <div className="col-md-6">
              <h4 className="text-primary">User Information</h4>
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>Name:</strong> {ticket.userName}
                </li>
                <li className="list-group-item">
                  <strong>Email:</strong> {ticket.userEmail}
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <h4 className="text-primary">Theater Information</h4>
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>Theater Name:</strong> {ticket.theaterName}
                </li>
                <li className="list-group-item">
                  <strong>Address:</strong> {ticket.address}
                </li>
                <li className="list-group-item">
                  <strong>Screen Name:</strong> {ticket.screenName}
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
          </div>

          <hr className="my-4" />

          {/* Offer Info */}
          {offerDetails && (
            <div className="row">
              <div className="col-md-12">
                <h4 className="text-primary">Offer Details</h4>
                <ul className="list-group">
                  <li className="list-group-item">
                    <strong>Offer Name:</strong> {offerDetails.offerName}
                  </li>
                  <li className="list-group-item">
                    <strong>Description:</strong> {offerDetails.description}
                  </li>
                  <li className="list-group-item">
                    <strong>Discount Value:</strong>{" "}
                    {offerDetails.discountValue}%
                  </li>
                  <li className="list-group-item">
                    <strong>Minimum Purchase Amount:</strong> ₹
                    {offerDetails.minPurchaseAmount}
                  </li>
                  <li className="list-group-item">
                    <strong>Validity:</strong>{" "}
                    {new Date(offerDetails.validityStart).toLocaleString()} to{" "}
                    {new Date(offerDetails.validityEnd).toLocaleString()}
                  </li>
                </ul>
              </div>
            </div>
          )}

          <hr className="my-4" />

          {/* Ticket and Movie Info */}
          <div className="row">
            <div className="col-md-8">
              <h4 className="text-primary">Ticket and Movie Information</h4>
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>Booking ID:</strong> {ticket.bookingId}
                </li>
                <li className="list-group-item">
                  <strong>Movie Title:</strong> {movieDetails.title}
                </li>
                <li className="list-group-item">
                  <strong>Genre:</strong> {movieDetails.genre.join(", ")}
                </li>
                <li className="list-group-item">
                  <strong>Duration:</strong> {movieDetails.duration}
                </li>
                <li className="list-group-item">
                  <strong>Seats:</strong> {ticket.seats?.join(", ") || "N/A"}
                </li>
                <li className="list-group-item">
                  <strong>Show Time:</strong> {ticket.showTime}
                </li>
                <li className="list-group-item">
                  <strong>Total Price:</strong> ₹{ticket.totalPrice}
                </li>
                <li className="list-group-item">
                  <strong>Payment Method:</strong> {ticket.paymentMethod}
                </li>
                <li className="list-group-item">
                  <strong>Payment Status:</strong>{" "}
                  <span className="badge bg-info">{ticket.paymentStatus}</span>
                </li>
              </ul>
            </div>
            <div className="col-md-4 d-flex justify-content-center align-items-center">
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
          </div>

          <hr className="my-4" />

          {/* Status Update */}
          <div className="row">
            <div className="col-md-12">
              <label htmlFor="statusSelect" className="form-label mt-3">
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
    </AdminLayout>
  );
};

export default AdminBookingDetailPage;
