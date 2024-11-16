import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useGetScreenByIdQuery } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";

type Seat = {
  seatNumber: string;
  isAvailable: boolean;
};

type ScreenDetails = {
  id: string;
  screenNumber: number;
  layout: Seat[][]; // Updated to reflect a 2D array for rows of seats
};

const SelectSeatPage: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useGetScreenByIdQuery(screenId);

  const screenDetails = data as ScreenDetails | null;

  console.log("screenDetails: ", screenDetails);
  

  const handleSelectSeat = (seatNumber: string) => {
    const newSelectedSeats = new Set(selectedSeats);
    if (newSelectedSeats.has(seatNumber)) {
      newSelectedSeats.delete(seatNumber);
    } else {
      newSelectedSeats.add(seatNumber);
    }
    setSelectedSeats(newSelectedSeats);
  };

  const handleConfirmSelection = () => {
    if (selectedSeats.size === 0) {
      toast.error("Please select at least one seat.");
      return;
    }
    navigate("/confirmation", { state: { seats: Array.from(selectedSeats) } });
  };

  useEffect(() => {
    document.title = screenDetails ? `Screen - ${screenDetails.screenNumber} - Select Seats` : "Select Seats";
  }, [screenDetails]);

  if (screenDetails && screenDetails.layout) {
    console.log("screenDetails.seatLayout: ", JSON.stringify(screenDetails.layout, null, 2));
  } else {
    console.log("seatLayout is not available in screenDetails.");
  }
  
  

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching seat data.");
    return <div>Error fetching seat data.</div>;
  }

  return (
    <Container style={{ padding: "40px 20px" }}>
      <Row className="mb-4">
        <Col>
          <h2 className="text-dark font-weight-bold">Screen - {screenDetails?.screenNumber}</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)} // navigate(-1) replaces history.goBack()
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            <FaArrowLeft /> Go Back
          </Button>
        </Col>
      </Row>

      <Row>
        {screenDetails?.layout ? (
          screenDetails.layout.map((row, rowIndex) => (
            <Row key={rowIndex} style={{ display: "flex", justifyContent: "center" }}>
              {row.map((seat, seatIndex) => (
                <Col key={seatIndex} style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
                  <Button
                    variant={seat.isAvailable ? "outline-primary" : "outline-secondary"}
                    onClick={() => handleSelectSeat(seat.seatNumber)}
                    disabled={!seat.isAvailable}
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      margin: "5px",
                      borderRadius: "50%",
                    }}
                  >
                    {seat.seatNumber}
                  </Button>
                </Col>
              ))}
            </Row>
          ))
        ) : (
          <p>No seats available for this screen.</p>
        )}
      </Row>

      <Row>
        <Col>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirmSelection}
            disabled={selectedSeats.size === 0}
            style={{
              marginTop: "20px",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            Confirm Selection ({selectedSeats.size} Seats)
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SelectSeatPage;
