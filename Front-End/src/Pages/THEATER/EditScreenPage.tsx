import React, { useState, useEffect } from "react";
import { Container, Form, Button, Modal, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useUpdateScreenMutation,
  useGetScreensByIdQuery,
  useGetMoviesMutation,
} from "../../Slices/TheaterApiSlice";
import TheaterSidebar from "../../Components/TheaterComponents/TheaterSideBar";
import { ShowTimeOption } from "../../Types/TheaterTypes";
import { MovieManagement } from "../../Types/MoviesTypes";

const EditScreen: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const [screenNumber, setScreenNumber] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [, setSelectedShowTimes] = useState<string[]>([]);
  const [numRows, setNumRows] = useState<number>(0);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(0);
  const [layout, setLayout] = useState<{ label: string | null }[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowTime, setSelectedShowTime] = useState<string>("");
  const [movies, setMovies] = useState<MovieManagement[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);
  const [showTimesWithMovies, setShowTimesWithMovies] = useState<
    { showTime: string; movieTitle: string; movieId: string }[]
  >([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    row: number;
    seat: number;
  } | null>(null);
  const [aislePositions, setAislePositions] = useState<string>("");

  const navigate = useNavigate();
  const { data: screen = {} } = useGetScreensByIdQuery(screenId);
  const [getMovies] = useGetMoviesMutation();
  const [updateScreen, { isLoading }] = useUpdateScreenMutation();

  console.log("screen: ", screen);

  useEffect(() => {
    if (screen) {
      setScreenNumber(screen.screenNumber || 0);
      setCapacity(screen.capacity || 0);
      setNumRows(screen.layout?.length || 0);
      setSeatsPerRow(screen.layout?.[0]?.length || 0);
      setLayout(screen.layout || []);
      setSelectedShowTimes(screen.showTimes || []);
      setShowTimesWithMovies(screen.showTimesWithMovies || []);
    }
  }, [screen]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true);
      try {
        const response = await getMovies({}).unwrap();
        setMovies(response.movies || []);
      } catch (err) {
        console.error("Error fetching movies", err);
      } finally {
        setIsLoadingMovies(false);
      }
    };
    fetchMovies();
  }, [getMovies]);

  const handleLayoutChange = () => {
    if (numRows > 0 && seatsPerRow > 0) {
      const aisleIndices = aislePositions
        .split(",")
        .map((pos) => parseInt(pos.trim(), 10) - 1); // Convert to zero-based index
      const newLayout = Array.from({ length: numRows }, (_, rowIndex) =>
        Array.from({ length: seatsPerRow }, (_, seatIndex) => {
          if (aisleIndices.includes(seatIndex)) {
            return { label: null }; // Empty cell for aisle
          }
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

  const deleteSeat = (rowIndex: number, seatIndex: number) => {
    setLayout((prevLayout) => {
      const newLayout = [...prevLayout];
      newLayout[rowIndex] = newLayout[rowIndex].filter(
        (_, index) => index !== seatIndex
      );
      return newLayout;
    });
  };

  const moveSeat = (
    fromRow: number,
    fromSeat: number,
    toRow: number,
    toSeat: number
  ) => {
    setLayout((prevLayout) => {
      const newLayout = [...prevLayout];
      const seatToMove = newLayout[fromRow][fromSeat];

      // Remove the seat from the original position
      newLayout[fromRow] = newLayout[fromRow].filter(
        (_, index) => index !== fromSeat
      );

      // Insert the seat into the new position
      newLayout[toRow].splice(toSeat, 0, seatToMove);
      return newLayout;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const totalSeats = numRows * seatsPerRow;
    if (totalSeats > capacity) {
      toast.error("Total seat count exceeds the specified capacity!");
      return;
    }

    const formattedShowTimes = showTimesWithMovies.map(
      ({ showTime, movieId, movieTitle }) => ({
        time: showTime,
        movie: movieId,
        movieTitle,
      })
    );

    try {
      await updateScreen({
        screenId,
        formData: {
          screenNumber: Number(screenNumber),
          capacity: Number(capacity),
          showTimes: formattedShowTimes,
          layout,
        },
      }).unwrap();
      toast.success("Screen updated successfully!");
      navigate(`/theater/management`);
    } catch (error) {
      console.error("Failed to update screen: ", error);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSaveShowTime = () => {
    if (selectedShowTime && selectedMovie) {
      const selectedMovieObject = movies.find(
        (movie) => movie._id === selectedMovie
      );
      if (selectedMovieObject) {
        const newShowTime = {
          showTime: selectedShowTime,
          movieTitle: selectedMovieObject.title,
          movieId: selectedMovieObject._id,
        };

        setShowTimesWithMovies((prev) => [
          ...prev,
          { ...newShowTime, _id: new Date().toISOString() },
        ]);

        // Only updating show times, not entire objects
        setSelectedShowTimes((prev) => [...prev, newShowTime.showTime]);

        setSelectedShowTime("");
        setSelectedMovie("");
        setShowModal(false);
        toast.success("Show time added successfully!");
      }
    } else {
      toast.warn("Please select both a show time and a movie.");
    }
  };

  const filteredMovies = movies.filter(
    (movie) =>
      !showTimesWithMovies.some(
        (showTimeWithMovie) => showTimeWithMovie.movieTitle === movie.title
      )
  );

  const movieOptions = filteredMovies.map((movie) => ({
    value: movie._id,
    label: movie.title,
  }));

  console.log("screen.showTimes: ", screen.showTimes);

  const showTimeOptions: ShowTimeOption[] = Array.isArray(screen.showTimes)
    ? screen.showTimes.map((showTimeObj: { time: string }) => ({
        value: showTimeObj.time,
        label: String(showTimeObj.time),
      }))
    : [];

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
          <h2 className="text-primary mb-4">Edit Screen</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formScreenNumber" className="mb-3">
              <Form.Label>Screen Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter screen number"
                value={screenNumber}
                onChange={(e) => setScreenNumber(Number(e.target.value))}
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
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
                min={0}
                style={{ borderColor: "#007bff" }}
              />
            </Form.Group>

            <Form.Group controlId="formShowTimes" className="mb-3">
              <Button
                variant="outline-primary"
                className="mt-3"
                onClick={handleShowModal}
              >
                Add Show Time
              </Button>
            </Form.Group>

            <div className="mt-3 mb-5">
              {showTimesWithMovies.length > 0 && (
                <>
                  <h5 className="mb-3 text-primary">Saved Show Times</h5>
                  <div className="row">
                    {showTimesWithMovies.map((item, index) => (
                      <div className="col-md-4 mb-3" key={index}>
                        <div
                          className="card shadow-sm border-primary"
                          style={{ minWidth: "120px" }}
                        >
                          <div className="card-body">
                            <h6 className="card-title text-truncate">
                              {item.movieTitle}
                            </h6>
                            <p className="card-text">
                              <strong>Show Time:</strong> {item.showTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

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
                <Col md={6}>
                  <Form.Label>Aisle Positions (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 3, 7"
                    value={aislePositions}
                    onChange={(e) => setAislePositions(e.target.value)}
                    className="mt-2"
                  />
                </Col>
              </Row>
              <Button
                variant="primary"
                className="mt-2"
                onClick={handleLayoutChange}
              >
                Generate Layout
              </Button>

              {layout.length > 0 && (
                <div className="mt-3">
                  <h5 className="mb-5">Seating Layout</h5>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {layout.map((row, rowIndex) => (
                      <div
                        key={`row-${rowIndex}`}
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        {row.map((seat, seatIndex) => (
                          <div
                            key={`seat-${seatIndex}`}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: seat.label ? "1px solid #007bff" : "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              margin: "2px 8px 20px 0px",
                              cursor: seat.label ? "pointer" : "default",
                              backgroundColor: seat.label ? "" : "#f0f0f0", // Background for aisle
                            }}
                            onClick={() =>
                              seat.label &&
                              setSelectedSeat({
                                row: rowIndex,
                                seat: seatIndex,
                              })
                            }
                          >
                            {seat.label || ""}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {selectedSeat &&
                    layout[selectedSeat.row][selectedSeat.seat]?.label && (
                      <div className="mt-3">
                        <Button
                          variant="danger"
                          onClick={() =>
                            deleteSeat(selectedSeat.row, selectedSeat.seat)
                          }
                        >
                          Delete Selected Seat
                        </Button>
                        <Button
                          variant="secondary"
                          className="ms-2"
                          onClick={() =>
                            moveSeat(
                              selectedSeat.row,
                              selectedSeat.seat,
                              selectedSeat.row,
                              Math.max(0, selectedSeat.seat - 1)
                            )
                          }
                        >
                          Move Left
                        </Button>
                        <Button
                          variant="secondary"
                          className="ms-2"
                          onClick={() =>
                            moveSeat(
                              selectedSeat.row,
                              selectedSeat.seat,
                              selectedSeat.row,
                              Math.min(seatsPerRow - 1, selectedSeat.seat + 1)
                            )
                          }
                        >
                          Move Right
                        </Button>
                      </div>
                    )}
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Screen"}
            </Button>
          </Form>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Show Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Movie</Form.Label>
              <Select
                options={movieOptions}
                value={
                  movieOptions.find(
                    (movie: { value: string }) => movie.value === selectedMovie
                  ) || null
                }
                onChange={(option) => {
                  if (option) {
                    setSelectedMovie(option.value);
                  } else {
                    setSelectedMovie("");
                  }
                }}
                placeholder="Select a movie"
                isLoading={isLoadingMovies}
              />
            </Form.Group>
            <Form.Group className="mt-4">
              <Form.Label>Select Show Time</Form.Label>
              <Select
                options={showTimeOptions}
                value={
                  showTimeOptions.find(
                    (time) => time.value === selectedShowTime
                  ) || null
                }
                onChange={(option) => {
                  if (option) {
                    setSelectedShowTime(option.value);
                  } else {
                    setSelectedShowTime("");
                  }
                }}
                placeholder="Select a show time"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveShowTime}>
            Save Show Time
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditScreen;
