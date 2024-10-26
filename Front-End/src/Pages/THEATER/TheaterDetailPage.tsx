import { useEffect } from "react";
import { Container, Card, Row, Col, Carousel } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useGetTheaterByTheaterIdQuery } from "../../Slices/TheaterApiSlice.js";
import TheaterLayout from "../../Components/TheaterComponents/TheaterLayout.jsx";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";

const THEATER_IMAGES_DIR_PATH = "http://localhost:5000/TheatersImages/";
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";

const TheaterDetailScreen = () => {
  const { id } = useParams();
  const { data: theater, isLoading, isError, refetch } = useGetTheaterByTheaterIdQuery(id);

  useEffect(() => {
    document.title = "Theater Details";
    refetch();
  }, [id, refetch]);

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching theater details");
    return <div>Error</div>;
  }

  return (
    <TheaterLayout theaterOwnerName={""}>
      <div style={{ maxHeight: "700px", overflowY: "auto", padding: "20px" }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={10}>
              <Card className="mb-4" style={{ width: "100%", padding: "20px", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}>
                <Carousel interval={3000} fade>
                  {theater.images && theater.images.length > 0 ? (
                    theater.images.map((image: string,) => (
                      <Carousel.Item>
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
                  <Card.Title style={{ color: "black", fontSize: "1.5rem", fontWeight: "bold" }}>
                    {theater.name} - {theater?.city}
                  </Card.Title>
                  <Card.Text>{theater?.address}</Card.Text>
                  <Card.Text>{theater?.description}</Card.Text>
                  <Card.Text>{theater?.amenities.join(", ")}</Card.Text>
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
