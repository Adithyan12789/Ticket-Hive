import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Carousel,
  Button,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import {
  FaMapMarkerAlt,
  FaFileAlt,
  FaTheaterMasks,
  FaCogs,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import {
  useGetTheaterByTheaterIdQuery,
  useGetScreensByTheaterIdQuery,
  useGetMoviesMutation,
  useDeleteScreenMutation,
} from "../../Slices/TheaterApiSlice";
import TheaterLayout from "../../Components/TheaterComponents/TheaterLayout";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";
import "./TheaterDetailsPage.css";
import { Screen } from "../../Types/ScreenTypes";
import { MovieManagement } from "../../Types/MoviesTypes";
import Swal from "sweetalert2";
import React from "react";
const THEATER_IMAGES_DIR_PATH = "https://tickethive.fun/TheatersImages/";
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";
const TheaterDetailScreen: React.FC = () => {
  const { id } = useParams();
  const {
    data: theater,
    isLoading: loadingTheater,
    isError: errorTheater,
    refetch,
  } = useGetTheaterByTheaterIdQuery(id);
  const { data: screens, isLoading: loadingScreens } =
    useGetScreensByTheaterIdQuery(id);
  const [, setMovies] = useState<MovieManagement[]>([]);
  const [getMovies] = useGetMoviesMutation();
  const [deleteScreen] = useDeleteScreenMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Theater Details";
    refetch();
  }, [id, refetch]);
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getMovies({}).unwrap();
        setMovies(fetchedMovies);
      } catch (error) {
        console.log("error: ", error);

        toast.error("Error fetching movies");
      }
    };
    fetchMovies();
  }, [getMovies]);
  useEffect(() => {
    if (selectedScreen && selectedScreen.schedule.length > 0) {
      const firstShowtime = selectedScreen.schedule[0].showTimes[0].time;
      setSelectedShowtime(firstShowtime);
    }
  }, [selectedScreen]);
  const handleOpenModal = (screen: Screen) => {
    setSelectedScreen(screen);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setSelectedScreen(null);
    setShowModal(false);
  };
  const handleDelete = async (screenId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await deleteScreen({ screenId }).unwrap();
        refetch();
        toast.success("Theater deleted successfully");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };
  const handleOpenGoogleMaps = () => {
    if (theater && theater.latitude && theater.longitude) {
      const googleMapsUrl = `https://www.google.com/maps?q=${theater.latitude},${theater.longitude}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      toast.error("Location details are not available.");
    }
  };
  if (loadingTheater || loadingScreens) return <Loader />;
  if (errorTheater) {
    toast.error("Error fetching theater details");
    return <div>Error fetching data</div>;
  }

  console.log("theater dfsdf: ", theater);
  console.log("screen dfsdf: ", screens);

  return (
    <TheaterLayout theaterOwnerName={""}>
      <div style={{ maxHeight: "700px", padding: "20px" }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={10}>
              <Card
                className="mb-4"
                style={{
                  width: "100%",
                  padding: "20px",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Carousel interval={3000} fade>
                  {theater.images && theater.images.length > 0 ? (
                    theater.images.map((image: string, index: number) => (
                      <Carousel.Item key={index}>
                        <Card.Img
                          variant="top"
                          src={`${THEATER_IMAGES_DIR_PATH}${image}`}
                          style={{ height: "400px", objectFit: "cover" }}
                        />
                      </Carousel.Item>
                    ))
                  ) : (
                    <Carousel.Item>
                      <Card.Img
                        variant="top"
                        src={DEFAULT_THEATER_IMAGE}
                        alt="Default theater image"
                        style={{ height: "400px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  )}
                </Carousel>

                <Card.Body style={{ marginTop: "20px" }}>
                  <Card.Title
                    style={{
                      color: "black",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      paddingBottom: "25px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaTheaterMasks
                      style={{ marginRight: "10px", verticalAlign: "middle" }}
                    />
                    {theater.name} - {theater.city}
                    {theater.isVerified ? (
                      <FaCheckCircle
                        style={{
                          color: "green",
                          marginLeft: "10px",
                          verticalAlign: "middle",
                        }}
                        title="Verified Theater"
                      />
                    ) : (
                      <FaTimesCircle
                        style={{
                          color: "red",
                          marginLeft: "10px",
                          verticalAlign: "middle",
                        }}
                        title="Not Verified Theater"
                      />
                    )}
                  </Card.Title>
                  <Card.Text>
                    <FaMapMarkerAlt
                      style={{
                        marginRight: "10px",
                        cursor: "pointer",
                      }}
                      onClick={handleOpenGoogleMaps}
                    />
                    {theater.address}
                  </Card.Text>
                  <Card.Text>
                    <FaFileAlt style={{ marginRight: "10px" }} />
                    {theater.description}
                  </Card.Text>
                  <Card.Text>
                    <FaCogs style={{ marginRight: "10px" }} />
                    {theater.amenities.join(", ")}
                  </Card.Text>

                  <div className="pt-3">
                    <Link to={`/theater/add-screen/${theater._id}`}>
                      <Button variant="success" className="ms-2">
                        Add Screen
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>{" "}
        <Container>
          <Row className="justify-content-center">
            <Col md={10}>
              <Row
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  marginLeft: "30px",
                  marginBottom: "100px",
                }}
              >
                {screens && screens.length > 0 ? (
                  screens.map((screen: Screen) => (
                    <Row
                      key={screen._id}
                      style={{
                        marginBottom: "20px",
                        padding: "20px",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 12px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 8px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      {/* Screen Number */}
                      <Col
                        md={2}
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.4rem",
                          color: "#007bff",
                        }}
                      >
                        Screen {screen.screenNumber}
                      </Col>

                      {/* Showtimes */}
                      <Col md={6} style={{ color: "#6c757d" }}>
                        <strong>Showtimes:</strong>{" "}
                        {screen.schedule
                          ?.flatMap((schedule) =>
                            schedule.showTimes.map(
                              (show) => `${show.movieTitle} at ${show.time}`
                            )
                          )
                          .join(", ") || "No showtimes available"}
                      </Col>

                      {/* Seating Capacity */}
                      <Col
                        md={2}
                        style={{
                          fontSize: "1rem",
                          color: "rgb(108, 117, 125)",
                        }}
                      >
                        <strong>Capacity:</strong> {screen.capacity}
                      </Col>

                      {/* Action Icons */}
                      <Col
                        md={2}
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                          alignItems: "center",
                        }}
                      >
                        <Link to={`/theater/edit-screen/${screen._id}`}>
                          <FontAwesomeIcon
                            icon={faEdit}
                            style={{
                              height: "25px",
                              cursor: "pointer",
                              color: "#007bff",
                              transition: "color 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#0056b3")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "#007bff")
                            }
                          />
                        </Link>

                        <FontAwesomeIcon
                          icon={faChair}
                          style={{
                            cursor: "pointer",
                            height: "25px",
                            color: "#28a745",
                            transition: "color 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#218838")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#28a745")
                          }
                          onClick={() => handleOpenModal(screen)}
                        />

                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{
                            cursor: "pointer",
                            height: "25px",
                            color: "#dc3545",
                            transition: "color 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#c82333")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#dc3545")
                          }
                          onClick={() => handleDelete(screen._id)}
                        />
                      </Col>
                    </Row>
                  ))
                ) : (
                  <Col>
                    <Card>
                      <Card.Body>
                        No screens available for this theater.
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
              <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="xl"
                centered
                dialogClassName="custom-modal-width"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    Screen Layout for Screen {selectedScreen?.screenNumber}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedScreen ? (
                    selectedScreen.schedule &&
                    selectedScreen.schedule.length > 0 ? (
                      <>
                        <Select
                          value={
                            selectedShowtime
                              ? {
                                  label: selectedShowtime,
                                  value: selectedShowtime,
                                }
                              : null
                          }
                          options={selectedScreen.schedule.flatMap(
                            (scheduleItem) =>
                              scheduleItem.showTimes.map((showTime) => ({
                                label: showTime.time,
                                value: showTime.time,
                              }))
                          )}
                          onChange={(selectedOption) =>
                            setSelectedShowtime(selectedOption?.value || null)
                          }
                          placeholder="Select a showtime"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              width: "250px",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              width: "250px",
                            }),
                          }}
                        />

                        {selectedShowtime &&
                          selectedScreen.schedule.map(
                            (scheduleItem, scheduleIndex) =>
                              scheduleItem.showTimes.map((showTime) => {
                                if (showTime.time === selectedShowtime) {
                                  return (
                                    <div
                                      key={`schedule-${scheduleIndex}`}
                                      style={{ marginBottom: "20px" }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          marginBottom: "60px",
                                        }}
                                      >
                                        <h5
                                          style={{
                                            margin: 0,
                                            padding: "10px 20px",
                                            backgroundColor: "#f8f9fa",
                                            border: "1px solid #007bff",
                                            borderRadius: "5px",
                                            fontSize: "1rem",
                                            textAlign: "center",
                                          }}
                                        >
                                          Date:{" "}
                                          {new Date(
                                            scheduleItem.date
                                          ).toLocaleDateString()}
                                        </h5>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "10px",
                                        }}
                                      >
                                        {showTime.layout.map(
                                          (row, rowIndex) => (
                                            <div
                                              key={`row-${rowIndex}`}
                                              style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginBottom:
                                                  rowIndex ===
                                                  Math.floor(
                                                    showTime.layout.length / 2
                                                  )
                                                    ? "50px"
                                                    : "10px",
                                                gap: "10px",
                                              }}
                                            >
                                              {row.map((seat, seatIndex) => (
                                                <React.Fragment
                                                  key={`seat-${seatIndex}`}
                                                >
                                                  {seatIndex ===
                                                    Math.floor(
                                                      row.length / 2
                                                    ) && (
                                                    <div
                                                      style={{ width: "30px" }}
                                                    ></div>
                                                  )}
                                                  <button
                                                    style={{
                                                      width: "30px",
                                                      height: "30px",
                                                      backgroundColor:
                                                        "#f8f9fa",
                                                      color: "#000",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      border:
                                                        "1px solid #007bff",
                                                      borderRadius: "4px",
                                                      fontSize: "0.8rem",
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    {seat.label}
                                                  </button>
                                                </React.Fragment>
                                              ))}
                                            </div>
                                          )
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center", // Centers horizontally
                                          justifyContent: "center", // Centers vertically if needed
                                          width: "100%", // Ensures it takes full width of the parent
                                          marginTop: "50px", // Adds spacing from the content above
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "50%",
                                            maxWidth: "250px",
                                            height: "12px",
                                            background:
                                              "linear-gradient(to bottom, rgb(96 176 255), #f8f9fa)",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "5px",
                                            fontWeight: "bold",
                                            boxShadow:
                                              "0px 4px 8px rgba(0, 0, 0, 0.3)",
                                          }}
                                        ></div>
                                        <div
                                          style={{
                                            fontSize: "10px",
                                            marginTop: "10px",
                                            textAlign: "center", // Align text to center
                                          }}
                                        >
                                          <p>All eyes this way please!</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })
                          )}
                      </>
                    ) : (
                      <p>No schedule available for this screen.</p>
                    )
                  ) : (
                    <p>No seat layout available for this screen.</p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Container>
      </div>
    </TheaterLayout>
  );
};

export default TheaterDetailScreen;
