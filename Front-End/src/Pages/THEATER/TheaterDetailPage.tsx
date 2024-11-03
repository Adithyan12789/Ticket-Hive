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
import { Screen, ShowTime } from "../../Types/ScreenTypes";
import { MovieManagement } from "../../Types/MoviesTypes";
import Swal from "sweetalert2";

const THEATER_IMAGES_DIR_PATH = "http://localhost:5000/TheatersImages/";
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";

const TheaterDetailScreen: React.FC = () => {
  const { id } = useParams();
  const {
    data: theater,
    isLoading: loadingTheater,
      isError: errorTheater,
      refetch,
  } = useGetTheaterByTheaterIdQuery(id);

  const {
    data: screens,
    isLoading: loadingScreens,
    isError: errorScreens,
  } = useGetScreensByTheaterIdQuery(id);

  const [, setMovies] = useState<MovieManagement[]>([]);
  const [getMovies] = useGetMoviesMutation();
  const [deleteScreen] = useDeleteScreenMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  useEffect(() => {
    document.title = "Theater Details";
    refetch();
  }, [id, refetch]);  

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getMovies({}).unwrap();
        setMovies(fetchedMovies);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Error fetching movies");
      }
    };

    fetchMovies();
  }, [getMovies]);

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

  if (loadingTheater || loadingScreens) return <Loader />;

  if (errorTheater) {
    toast.error("Error fetching theater details");
    return <div>Error fetching data</div>;
  }

  if (errorScreens) {
    toast.error("Error fetching screens");
    return <div>Error fetching data</div>;
  }

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
                    <FaMapMarkerAlt style={{ marginRight: "10px" }} />
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

                  <Row
                    style={{
                      width: "100%",
                      maxWidth: "1200px",
                      margin: "0 auto",
                    }}
                  >
                    {screens && screens.length > 0 ? (
                      screens.map((screen: Screen) => (
                        <Col md={4} key={screen._id} className="mb-3">
                          <Card style={{ padding: "15px", cursor: "pointer" }}>
                            <Card.Title
                              style={{
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              Screen {screen.screenNumber}
                            </Card.Title>
                            <Card.Text>
                              Showtimes:{" "}
                              {(screen.showTimes as unknown as ShowTime[])
                                .map(
                                  (show) => `${show.movieTitle} at ${show.time}`
                                )
                                .join(", ")}
                            </Card.Text>
                            <Card.Text>
                              Seating Capacity: {screen.capacity}
                            </Card.Text>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                                marginTop: "20px",
                              }}
                            >
                              <Link to={`/theater/edit-screen/${screen._id}`}>
                                <FontAwesomeIcon
                                  icon={faEdit}
                                  style={{
                                    height: "25px",
                                    cursor: "pointer",
                                    color: "#007bff",
                                  }}
                                />
                              </Link>

                              <FontAwesomeIcon
                                icon={faChair} // Replace with appropriate icon for seats
                                style={{
                                  cursor: "pointer",
                                  marginLeft: "40px",
                                  height: "25px",
                                  color: "#007bff",
                                }}
                                onClick={() => handleOpenModal(screen)}
                              />

                              <FontAwesomeIcon
                                icon={faTrash}
                                style={{
                                  cursor: "pointer",
                                  marginLeft: "40px",
                                  height: "25px",
                                  color: "red",
                                }}
                                onClick={() => handleDelete(screen._id)}
                              />
                            </div>
                          </Card>
                        </Col>
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
                    size="lg"
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        Screen Layout for Screen {selectedScreen?.screenNumber}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {selectedScreen ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {selectedScreen.layout.map((row, rowIndex) => (
                            <div
                              key={rowIndex}
                              style={{
                                display: "flex",
                                gap: "6px", // Default gap between seats
                              }}
                            >
                              {row.map((seat, seatIndex) => (
                                <div
                                  key={seatIndex}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: "#e0e0e0", // Subtle background color for seats
                                    color: "#333",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "4px",
                                    boxShadow: "0px 0px 2px rgba(0,0,0,0.2)", // Subtle shadow for a more realistic look
                                    fontSize: "0.8rem",
                                    marginRight:
                                      (seatIndex + 1) % 5 === 0
                                        ? "20px"
                                        : "6px", // Larger gap after every 5th seat
                                  }}
                                >
                                  {seat.label}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
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
        </Container>
      </div>
    </TheaterLayout>
  );
};

export default TheaterDetailScreen;
