import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  id: string;
  screenNumber: number;
  layout: Seat[][];
};

const SelectSeatPage: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [, setLayout] = useState<Seat[][]>([]);

  const { data, isLoading, isError } = useGetScreenByIdQuery(screenId);
  const screenDetails = data as ScreenDetails | null;

  useEffect(() => {
    document.title = screenDetails
      ? `Screen - ${screenDetails.screenNumber} - Select Seats`
      : "Select Seats";
  }, [screenDetails]);

  useEffect(() => {
    if (screenDetails?.layout) {
      setLayout(screenDetails.layout);
    } else {
      setLayout(generateSeatNames(5, 8)); // Reduced number of seats for smaller layout
    }
  }, [screenDetails]);

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
              marginBottom: rowIndex === Math.floor(screenDetails.layout.length / 2) ? "20px" : "5px", // Reduced margin
              gap: "5px", // Reduced gap between buttons
            }}
          >
            {row.map((seat, seatIndex) => (
              <React.Fragment key={`seat-${seatIndex}`}>
                {seatIndex === Math.floor(row.length / 2) && <div style={{ width: "20px" }}></div>}
                <button
                  style={{
                    width: "35px", // Smaller button size
                    height: "35px", // Smaller button size
                    backgroundColor: "#f8f9fa",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #007bff",
                    borderRadius: "4px",
                    fontSize: "0.7rem", // Smaller font size
                    cursor: "pointer",
                  }}
                  onClick={() => handleSeatSelection(seat.label, seat.isAvailable)}
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
            backgroundColor: "rgb(124, 187, 255)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "50px", // Reduced top margin
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
        </div>
      </div>
    );
  };

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching seat data.");
    return <div>Error fetching seat data.</div>;
  }

  return (
    <Container style={{ padding: "30px 15px" }}> {/* Reduced padding */}
      <Row className="mb-3">
        <Col>
          <h2 className="text-dark font-weight-bold">
            Screen - {screenDetails?.screenNumber}
          </h2>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
            style={{ fontSize: "0.9rem", fontWeight: "bold" }} // Smaller font size
          >
            <FaArrowLeft /> Go Back
          </Button>
        </Col>
      </Row>

      <Row>{renderScreenLayout()}</Row>
    </Container>
  );
};

export default SelectSeatPage;
