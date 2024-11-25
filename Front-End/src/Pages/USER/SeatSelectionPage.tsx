import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useGetScreenByIdQuery } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import React from "react";
import { Seat, Screen } from "../../Types/ScreenTypes";

const SelectSeatPage: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [, setLayout] = useState<Seat[][]>([]);
  const [loading, setLoading] = useState<boolean>(true); 

  const { data, refetch, isLoading, isError } = useGetScreenByIdQuery(screenId);

  const screenDetails = data as Screen | null;

  console.log("screenDetails: ", screenDetails);

  const location = useLocation();

  const { date, movieTitle, movieId, theaterId, showTime, showTimeId } =
    location.state || {};

  console.log("movieId: ", movieId);
  console.log("theaterId: ", theaterId);
  console.log("showTimeId: ", showTimeId);

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  console.log(formattedDate);
  console.log(screenId, date, movieTitle);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = screenDetails
      ? `Screen - ${screenDetails.screenNumber} - Select Seats`
      : "Select Seats";
      refetch();
  }, [screenDetails, refetch]);

  useEffect(() => {
    if (screenDetails && showTimeId) {
      const selectedShowTime = screenDetails.showTimes.find(
        (showTime) => showTime._id === showTimeId
      );

      if (selectedShowTime) {
        setLayout(selectedShowTime.layout);
      } else {
        toast.error("Show time not found.");
      }
    } else {
      setLayout(generateSeatNames(5, 8));
    }
  }, [screenDetails, showTimeId]);

  const generateSeatNames = (rows: number, cols: number): Seat[][] => {
    const layout: Seat[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: Seat[] = [];
      const rowPrefix = String.fromCharCode(65 + (i % 26));
      for (let j = 1; j <= cols; j++) {
        row.push({
          label: `${rowPrefix}${j.toString().padStart(2, "0")}`,
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
      // Hold the seat for 10 minutes
      setTimeout(() => {
        // Remove seat from selected seats after 10 minutes if not booked
        newSelectedSeats.delete(seatLabel);
        setSelectedSeats(newSelectedSeats);
      }, 10 * 60 * 1000); // 10 minutes timeout
    }
  
    setSelectedSeats(newSelectedSeats);
  };  

  const renderScreenLayout = () => {
    if (!screenDetails) return <p>No seat layout available for this screen.</p>;

    const selectedShowTime = screenDetails.showTimes.find(
      (showTime) => showTime._id === showTimeId
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
        }}
      >
        {selectedShowTime?.layout.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom:
                rowIndex ===
                Math.floor(selectedShowTime?.layout.length / 2)
                  ? "20px"
                  : "5px",
              gap: "8px",
            }}
          >
            {row.map((seat, seatIndex) => (
              <React.Fragment key={`seat-${seatIndex}`}>
                {seatIndex === Math.floor(row.length / 2) && (
                  <div style={{ width: "20px" }}></div>
                )}
                <button
                  style={{
                    width: "30px",
                    height: "30px", 
                    backgroundColor: selectedSeats.has(seat.label)
                      ? "rgb(0 185 255)" 
                      : seat.isAvailable
                      ? "#f8f9fa" 
                      : "gray",
                    color: selectedSeats.has(seat.label) ? "#fff" : "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #007bff",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    cursor: seat.isAvailable ? "pointer" : "not-allowed",
                    transition: "background-color 0.3s",
                  }}
                  onClick={() =>
                    handleSeatSelection(seat.label, seat.isAvailable)
                  }
                  disabled={!seat.isAvailable}
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
            background: "linear-gradient(to bottom, rgb(96 176 255), #f8f9fa)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "50px",
            borderRadius: "5px",
            fontWeight: "bold",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        ></div>
        <div style={{ fontSize: "10px", marginTop: "10px" }}>
          <p>All eyes this way please!</p>
        </div>
      </div>
    );
  };

  const totalSeats = selectedSeats.size;
  const ticketPrice = screenDetails?.theater?.ticketPrice || 0;
  const totalPrice = totalSeats * ticketPrice;

  if (loading || isLoading) return <Loader />;
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
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
