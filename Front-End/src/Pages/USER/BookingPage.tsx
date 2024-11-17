import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { FaRegCalendarAlt, FaFilm, FaTicketAlt } from "react-icons/fa";

const BookingPage: React.FC = () => {
  const location = useLocation();
  const { selectedSeats, theaterName, date, movieTitle, totalPrice } = location.state || {};

  if (totalPrice === undefined) {
    return <p>Error: Total price is missing!</p>; // Display error if totalPrice is missing
  }

  const convenienceFee = totalPrice * 0.10;

  // Calculate the final total price including the convenience fee
  const finalPrice = totalPrice + convenienceFee;

  // Format the date to show the full date (e.g., Sunday, 11 Nov 2024)
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Container className="mt-5" style={{ maxWidth: "900px" }}>
      <h2 className="text-center mb-4" style={{ fontSize: "2.5rem", fontWeight: "300", color: "rgb(110 182 255)", fontFamily: "'Poppins', sans-serif" }}>
        Booking Confirmation
      </h2>

      <Card className="shadow-lg rounded-lg border-0">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
          {/* Movie Title */}
          <div className="d-flex align-items-center mb-4 justify-content-center">
            <FaFilm style={{ fontSize: "2rem", marginRight: "10px", color: "#e74c3c" }} />
            <h4 className="m-0" style={{ fontSize: "1.6rem", fontWeight: "500", color: "#34495e", fontFamily: "'Poppins', sans-serif" }}>
              {movieTitle}
            </h4>
          </div>

          {/* Theater and Date Details */}
          <div className="mb-4" style={{ fontSize: "1.1rem", color: "#7f8c8d", fontFamily: "'Poppins', sans-serif" }}>
            <div className="mb-2">
              <FaTicketAlt style={{ fontSize: "1.5rem", marginRight: "10px", color: "#3498db" }} />
              {theaterName}
            </div>
            <div className="mb-2">
              <FaRegCalendarAlt style={{ fontSize: "1.5rem", marginRight: "10px", color: "#3498db" }} />
              {formattedDate}
            </div>
          </div>

          {/* Seat Details */}
          <div className="mb-4" style={{ fontSize: "1.2rem", color: "#34495e", fontFamily: "'Poppins', sans-serif" }}>
            <strong style={{ fontWeight: "500" }}>Seats:</strong>{" "}
            {selectedSeats && selectedSeats.length > 0
              ? selectedSeats.join(", ")
              : "No seats selected"}
          </div>

          <hr /> {/* Horizontal line after seats section */}

          {/* Price Summary */}
          <div className="mb-4" style={{ fontSize: "1.2rem", color: "#2c3e50", fontFamily: "'Poppins', sans-serif" }}>
            <p><strong>Total Price (without convenience fee):</strong> <span className="font-weight-bold">Rs. {totalPrice}</span></p>
            <p><strong>Convenience Fee (10%):</strong> <span className="font-weight-bold">Rs. {convenienceFee.toFixed(2)}</span></p>
            <hr /> {/* Horizontal line after convenience fee section */}
            <p><strong>Total Price (with convenience fee):</strong> <span className="font-weight-bold">Rs. {finalPrice.toFixed(2)}</span></p>
          </div>

          {/* Proceed Button */}
          <div className="d-flex justify-content-center">
            <Button
              variant="danger"
              size="lg"
              className="px-5 py-3"
              style={{
                background: "black",
                border: "none",
                borderRadius: "50px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                fontWeight: "600",
                letterSpacing: "1px",
                transition: "all 0.3s ease-in-out",
                fontFamily: "'Poppins', sans-serif", // Add Poppins to the button as well
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgb(0 207 219)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}  
            >
              Proceed to Payment
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingPage;
