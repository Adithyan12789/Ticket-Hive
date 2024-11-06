import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Modal } from "react-bootstrap";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useAddScreenMutation,
  useGetTheaterByTheaterIdQuery,
  useGetMoviesMutation,
} from "../../Slices/TheaterApiSlice";
import TheaterSidebar from "../../Components/TheaterComponents/TheaterSideBar";
import { ShowTimeOption } from "../../Types/TheaterTypes";
import { MovieManagement } from "../../Types/MoviesTypes";

const AddScreenPage: React.FC = () => {
  const { theaterId } = useParams<{ theaterId: string }>();
  const [screenNumber, setScreenNumber] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [, setSelectedShowTimes] = useState<string[]>([]);
  const [numRows, setNumRows] = useState<number>(0);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(0);
  const [layout, setLayout] = useState<{ label: string }[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowTime, setSelectedShowTime] = useState<string>("");
  const [movies, setMovies] = useState<MovieManagement[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);
  const [showTimesWithMovies, setShowTimesWithMovies] = useState<
    { showTime: string; movieTitle: string; movieId: string }[]
  >([]);

  const navigate = useNavigate();
  const { data: theater } = useGetTheaterByTheaterIdQuery(theaterId);
  const [getMovies] = useGetMoviesMutation();
  const [addScreen, { isLoading }] = useAddScreenMutation();

  console.log("add theaters page: ", theater);

  useEffect(() => {
    if (theater && theater.showTimes) {
      setSelectedShowTimes(theater.showTimes);
    }
  }, [theater]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true); 
      try {
        const response = await getMovies({}).unwrap();
        setMovies(response.movies || []);
        if ((response.movies || []).length === 0) {
          handleShowModal();
        }
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

    const formattedShowTimes = showTimesWithMovies.map(
      ({ showTime, movieId, movieTitle }) => ({
        time: showTime,
        movie: movieId,
        movieTitle: movieTitle,
      })
    );

    try {
      await addScreen({
        theaterId,
        formData: {
          screenNumber: Number(screenNumber),
          capacity: Number(capacity),
          showTimes: formattedShowTimes,
          layout,
        },
      }).unwrap();
      toast.success("Screen added successfully!");
      navigate(`/theater/details/${theater?._id}`);
      setScreenNumber(0);
      setCapacity(0);
      setSelectedShowTimes([]);
      setLayout([]);
      setShowTimesWithMovies([]);
    } catch (error) {
      toast.error("Failed to add screen");
      console.error("Failed to add screen:", error);
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

        setShowTimesWithMovies((prev) => [...prev, newShowTime]);

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

  const movieOptions = filteredMovies.map((movie: MovieManagement) => ({
    value: movie._id,
    label: movie.title,
  }));

  const filteredShowTimes =
    theater?.showTimes?.filter(
      (time: string) =>
        !showTimesWithMovies.some(
          (showTimeWithMovie) => showTimeWithMovie.showTime === time
        )
    ) || [];

  const showTimeOptions: ShowTimeOption[] = filteredShowTimes.map(
    (time: string) => ({
      value: time,
      label: time,
    })
  );

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

            {/* Show Times Selector */}
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
              {/* Conditionally render the header only if there are saved showtimes */}
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
                    {layout.slice(0, 2).map((row, rowIndex) => (
                      <div
                        key={`first-set-${rowIndex}`}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {row.map((seat, seatIndex) => (
                          <div
                            key={`first-set-seat-${seatIndex}`}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: "1px solid #007bff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              margin: "2px 8px 20px 0px",
                            }}
                          >
                            {seat.label}
                          </div>
                        ))}
                      </div>
                    ))}

                    {layout.slice(2).map((row, rowIndex) => (
                      <div
                        key={`rest-set-${rowIndex + 2}`}
                        style={{
                          display: "flex",
                          marginTop: "10px",
                          justifyContent: "center",
                        }}
                      >
                        {row.map((seat, seatIndex) => (
                          <div
                            key={`rest-set-seat-${seatIndex}`}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: "1px solid #007bff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              margin: "5px",
                              marginRight:
                                (seatIndex + 1) % Math.ceil(seatsPerRow / 2) ===
                                0
                                  ? "40px"
                                  : "10px",
                            }}
                          >
                            {seat.label}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Screen"}
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Modal for adding show time */}
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

export default AddScreenPage;
