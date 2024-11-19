import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useGetScreenByIdQuery } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import React from "react";

type Seat = {
  label: string;
  isAvailable: boolean;
};

type ScreenDetails = {
  _id: string;
  screenNumber: number;
  layout: Seat[][]; // Array of rows, each row is an array of seats
  movieTitle: string; // Added movie title field
  theater: {
    name: string; // Theater name field
    ticketPrice: number;
  };
  showDate: string; // Date field for the show
};

const SelectSeatPage: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [, setLayout] = useState<Seat[][]>([]);

  const { data, isLoading, isError } = useGetScreenByIdQuery(screenId);
  const screenDetails = data as ScreenDetails | null;

  console.log("screenDetails: ", screenDetails);

  const location = useLocation();

  const { date, movieTitle, movieId, theaterId, showTime } =
    location.state || {};

  console.log("movieId: ", movieId);
  console.log("theaterId: ", theaterId);

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  console.log(formattedDate);
  console.log(screenId, date, movieTitle);

  useEffect(() => {
    document.title = screenDetails
      ? `Screen - ${screenDetails.screenNumber} - Select Seats`
      : "Select Seats";
  }, [screenDetails]);

  useEffect(() => {
    if (screenDetails?.layout) {
      setLayout(screenDetails.layout);
    } else {
      setLayout(generateSeatNames(5, 8)); // Default layout if no data is found
    }
  }, [screenDetails]);

  const generateSeatNames = (rows: number, cols: number): Seat[][] => {
    const layout: Seat[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: Seat[] = [];
      const rowPrefix = String.fromCharCode(65 + (i % 26)); // Row names from A to Z
      for (let j = 1; j <= cols; j++) {
        row.push({
          label: `${rowPrefix}${j.toString().padStart(2, "0")}`, // Seat label like A01, A02...
          isAvailable: true,
        });
      }
      layout.push(row);
    }
    return layout;
  };

  const handleSeatSelection = (seatLabel: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    const newSelectedSeats = new Set(selectedSeats);
    if (newSelectedSeats.has(seatLabel)) {
      newSelectedSeats.delete(seatLabel);
    } else {
      newSelectedSeats.add(seatLabel);
    }
    setSelectedSeats(newSelectedSeats);
  };

  const renderScreenLayout = () => {
    if (!screenDetails) return <p>No seat layout available for this screen.</p>;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px", // Reduced gap between rows
        }}
      >
        {screenDetails.layout.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom:
                rowIndex === Math.floor(screenDetails.layout.length / 2)
                  ? "20px"
                  : "5px", // Reduced margin
              gap: "8px", // Reduced gap between buttons
            }}
          >
            {row.map((seat, seatIndex) => (
              <React.Fragment key={`seat-${seatIndex}`}>
                {seatIndex === Math.floor(row.length / 2) && (
                  <div style={{ width: "20px" }}></div>
                )}
                <button
                  style={{
                    width: "30px", // Smaller button size
                    height: "30px", // Smaller button size
                    backgroundColor: selectedSeats.has(seat.label)
                      ? "rgb(0 185 255)" // Highlight selected seat
                      : seat.isAvailable
                      ? "#f8f9fa" // Default for available seats
                      : "gray", // Disabled color for unavailable seats
                    color: selectedSeats.has(seat.label) ? "#fff" : "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #007bff",
                    borderRadius: "4px",
                    fontSize: "0.7rem", // Smaller font size
                    cursor: seat.isAvailable ? "pointer" : "not-allowed", // Disable cursor for unavailable seats
                    transition: "background-color 0.3s", // Smooth transition
                  }}
                  onClick={() =>
                    handleSeatSelection(seat.label, seat.isAvailable)
                  }
                  disabled={!seat.isAvailable} // Disable click on unavailable seats
                >
                  {seat.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        ))}
        <div
          style={{
            width: "50%",
            maxWidth: "250px",
            height: "12px",
            background: "linear-gradient(to bottom, rgb(96 176 255), #f8f9fa)", // Added gradient for light effect
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "50px",
            borderRadius: "5px",
            fontWeight: "bold",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", // Box shadow for depth
          }}
        ></div>
        <div style={{ fontSize: "10px", marginTop: "10px" }}>
          <p>All eyes this way please!</p>
        </div>
      </div>
    );
  };

  const totalSeats = selectedSeats.size;
  const ticketPrice = screenDetails?.theater?.ticketPrice || 0; // Default to 0 if undefined
  const totalPrice = totalSeats * ticketPrice;

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching seat data.");
    return <div>Error fetching seat data.</div>;
  }

  return (
    <Container
      style={{ padding: "30px 15px", position: "relative", minHeight: "100vh" }}
    >
      {/* Row for Go Back Icon and Movie Title with UA Text */}
      <Row className="mb-3">
        <Col>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            <FaArrowLeft
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
            />
            <div>
              <span style={{ fontSize: "1.2rem" }}>
                {movieTitle || "Movie Title"} {/* Movie title */}
              </span>
              <span
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  marginLeft: "10px",
                  color: "#007bff",
                  fontWeight: "600",
                }}
              >
                UA
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Row for Screen Number, Theater Name and Date */}
      <Row className="mb-3">
        <Col>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#343a40",
              fontWeight: "500",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Screen {screenDetails?.screenNumber} {/* Screen number */}
            <br />
            {screenDetails?.theater.name || "Theater Name"} |{" "}
            {formattedDate || "Show Date"} {/* Theater name and date */}
          </div>
        </Col>
      </Row>

      {/* Render Screen Layout */}
      <Row>{renderScreenLayout()}</Row>
      {/* Pay Button */}
      {selectedSeats.size > 0 && (
        <div
          style={{
            position: "fixed",
            width: "100%",
            backgroundColor: "rgb(225 225 225)",
            height: "80px",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            display: "flex", // Add flexbox
            justifyContent: "center", // Center content horizontally
            alignItems: "center", // Center content
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
          }}
        >
          <Button
            style={{
              width: "200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            variant="primary"
            onClick={() => {
              navigate("/booking", {
                state: {
                  selectedSeats: [...selectedSeats],
                  theaterName: screenDetails?.theater.name,
                  date: formattedDate,
                  movieTitle: movieTitle,
                  totalPrice: totalPrice,
                  movieId: movieId,
                  theaterId: theaterId,
                  screenId: screenId,
                  showTime: showTime,
                },
              });
            }}
          >
            <div style={{ fontSize: "16px", textAlign: "center" }}>
              <div>Pay Rs.{totalPrice}</div>
              <div style={{ fontSize: "10px", color: "whitesmoke" }}>
                {totalSeats} {totalSeats === 1 ? "ticket" : "tickets"}
              </div>
            </div>
          </Button>
        </div>
      )}
    </Container>
  );
};

export default SelectSeatPage;
