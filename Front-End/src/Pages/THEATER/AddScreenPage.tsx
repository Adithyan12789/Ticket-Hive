import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import Select, { MultiValue } from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useAddScreenMutation,
  useGetTheaterByTheaterIdQuery,
} from "../../Slices/TheaterApiSlice";
import TheaterSidebar from "../../Components/TheaterComponents/TheaterSideBar";
import { ShowTimeOption } from "../../Types/TheaterTypes";

const AddScreenPage: React.FC = () => {
  const { theaterId } = useParams<{ theaterId: string }>();
  const [screenNumber, setScreenNumber] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [selectedShowTimes, setSelectedShowTimes] = useState<string[]>([]);
  const [numRows, setNumRows] = useState<number>(0);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(0);
  const [layout, setLayout] = useState<{ label: string }[][]>([]);
  const navigate = useNavigate();

  const { data: theater } = useGetTheaterByTheaterIdQuery(theaterId);
  const [addScreen, { isLoading }] = useAddScreenMutation();

  useEffect(() => {
    if (theater && theater.showTimes) {
      setSelectedShowTimes(theater.showTimes);
    }
  }, [theater]);

  const handleShowTimesChange = (options: MultiValue<ShowTimeOption>) => {
    setSelectedShowTimes(options ? options.map((opt) => opt.value) : []);
  };

  const handleLayoutChange = () => {
    if (numRows > 0 && seatsPerRow > 0) {
      const newLayout = Array.from({ length: numRows }, (_, rowIndex) =>
        Array.from({ length: seatsPerRow }, (_, seatIndex) => {
          const rowLabel = String.fromCharCode(65 + rowIndex);
          const seatLabel = `${rowLabel}${String(seatIndex + 1).padStart(
            2,
            "0"
          )}`;
          return { label: seatLabel };
        })
      );
      setLayout(newLayout);
    } else {
      toast.warn(
        "Please set both rows and seats per row to generate a layout."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const totalSeats = numRows * seatsPerRow;

    if (totalSeats > capacity) {
      toast.error("Total seat count exceeds the specified capacity!");
      return;
    }

    try {
      await addScreen({
        theaterId,
        formData: {
          screenNumber: Number(screenNumber),
          capacity: Number(capacity),
          showTimes: selectedShowTimes,
          layout,
        },
      }).unwrap();
      toast.success("Screen added successfully!");
      navigate(`/theater/details/${theater?._id}`);
      setScreenNumber(0);
      setCapacity(0);
      setSelectedShowTimes([]);
      setLayout([]);
    } catch (error) {
      toast.error("Failed to add screen");
      console.error("Failed to add screen:", error);
    }
  };

  const showTimeOptions: ShowTimeOption[] =
    theater?.showTimes?.map((time: string) => ({
      value: time,
      label: time,
    })) || [];

  return (
    <Container
      className="mt-4 p-4"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      }}
    >
      <Row>
        <Col md={3}>
          <TheaterSidebar />
        </Col>
        <Col md={9}>
          <h2 className="text-primary mb-4">Add New Screen</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formScreenNumber" className="mb-3">
              <Form.Label>Screen Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter screen number"
                value={screenNumber}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setScreenNumber(value >= 0 ? value : 0);
                }}
                required
                min={0}
                style={{ borderColor: "#007bff" }}
              />
            </Form.Group>

            <Form.Group controlId="formCapacity" className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter capacity"
                value={capacity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setCapacity(value >= 0 ? value : 0);
                }}
                required
                min={0}
                style={{ borderColor: "#007bff" }}
              />
            </Form.Group>

            <Form.Group controlId="formShowTimes" className="mb-3">
              <Form.Label>Select Show Times</Form.Label>
              <Select
                isMulti
                options={showTimeOptions}
                value={showTimeOptions.filter((opt) =>
                  selectedShowTimes.includes(opt.value)
                )}
                onChange={handleShowTimesChange}
                placeholder="Select show times..."
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: "#007bff",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#0056b3",
                    },
                  }),
                }}
              />
            </Form.Group>

            <Form.Group controlId="formLayout" className="mb-3">
              <Form.Label>Seating Layout</Form.Label>
              <Row>
                <Col md={6}>
                  <Form.Label>Number of Rows</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Button
                      variant="outline-primary"
                      style={{ height: "50px" }}
                      onClick={() => setNumRows((prev) => prev + 1)}
                      className="mt-2 me-2"
                    >
                      +
                    </Button>
                    <Form.Control
                      type="number"
                      min={0}
                      value={numRows}
                      onChange={(e) => setNumRows(Number(e.target.value))}
                      required
                      style={{ borderColor: "#007bff" }}
                      readOnly
                      className="mt-2 me-2"
                    />
                    <Button
                      variant="outline-danger"
                      style={{ height: "50px" }}
                      onClick={() =>
                        setNumRows((prev) => (prev > 0 ? prev - 1 : 0))
                      }
                      className="mt-2"
                    >
                      -
                    </Button>
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Label>Seats Per Row</Form.Label>
                  <div style={{ display: "flex" }}>
                    <Button
                      variant="outline-primary"
                      style={{ height: "50px" }}
                      onClick={() => setSeatsPerRow((prev) => prev + 1)}
                      className="mt-2 me-2"
                    >
                      +
                    </Button>
                    <Form.Control
                      type="number"
                      min={0}
                      value={seatsPerRow}
                      onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                      required
                      style={{ borderColor: "#007bff" }}
                      readOnly
                      className="mt-2 me-2"
                    />
                    <Button
                      variant="outline-danger"
                      style={{ height: "50px" }}
                      onClick={() =>
                        setSeatsPerRow((prev) => (prev > 0 ? prev - 1 : 0))
                      }
                      className="mt-2"
                    >
                      -
                    </Button>
                  </div>
                </Col>
              </Row>

              <Button
                variant="secondary"
                onClick={handleLayoutChange}
                className="mt-2"
              >
                Generate Layout
              </Button>
            </Form.Group>

            <Form.Group controlId="formGeneratedLayout" className="mb-3">
              <Form.Label>Generated Layout</Form.Label>
              {layout.length > 0 && (
                <div
                  className="mt-2"
                  style={{
                    padding: "10px",
                  }}
                >
                  {layout.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{ display: "flex", marginBottom: "5px" }}
                    >
                      {row.map((seat, seatIndex) => (
                        <div
                          key={seatIndex}
                          style={{
                            width: "40px",
                            height: "30px",
                            border: "1px solid #007bff",
                            textAlign: "center",
                            lineHeight: "30px",
                            marginRight: "10px",
                            borderRadius: "3px",
                            transition: "background-color 0.3s",
                          }}
                        >
                          {seat.label}
                        </div>
                      ))}

                      {(rowIndex + 1) % 5 === 0 && (
                        <div style={{ height: "10px" }} />
                      )}{" "}

                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="mt-3"
            >
              {isLoading ? "Adding..." : "Add Screen"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddScreenPage;
