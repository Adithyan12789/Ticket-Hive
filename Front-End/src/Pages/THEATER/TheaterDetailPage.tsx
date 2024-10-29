import { useEffect } from "react";
import { Container, Card, Row, Col, Carousel, Button } from "react-bootstrap";
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
} from "../../Slices/TheaterApiSlice.js";
import TheaterLayout from "../../Components/TheaterComponents/TheaterLayout.jsx";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";
import "./TheaterDetailsPage.css";
import { Screen } from "../../Types.js";

const THEATER_IMAGES_DIR_PATH = "http://localhost:5000/TheatersImages/";
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";

const TheaterDetailScreen = () => {
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
  } = useGetScreensByTheaterIdQuery(id); // Updated query

  useEffect(() => {
    document.title = "Theater Details";
    refetch();
  }, [id, refetch]);

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
                {/* Carousel for theater images */}
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

                  <Row>
                    {screens && screens.length > 0 ? (
                      screens.map((screen: Screen) => (
                        <Col md={6} key={screen._id} className="mb-3">
                          <Card style={{ padding: "15px" }}>
                            <Card.Title
                              style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                            >
                              Screen {screen.screenNumber}
                            </Card.Title>
                            <Card.Text>
                              <strong>Showtimes:</strong>{" "}
                              {screen.showTimes.join(", ")}
                            </Card.Text>
                            <Card.Text>
                              <strong>Seating Capacity:</strong>{" "}
                              {screen.capacity}
                            </Card.Text>
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
