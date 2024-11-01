import { useEffect } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { FaFileAlt, FaTheaterMasks, FaRegClock, FaRegCalendarAlt, FaGlobeAmericas, FaUserAlt, FaTag } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetMovieByMovieIdQuery } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";

const THEATER_IMAGES_DIR_PATH = "http://localhost:5000/MoviePosters/";

const MovieDetailScreen: React.FC = () => {
  const { id } = useParams();
  const {
    data: movie,
    isLoading: loadingTheater,
    isError: errorTheater,
    refetch,
  } = useGetMovieByMovieIdQuery(id);

  useEffect(() => {
    document.title = movie ? `${movie.title} - Movie Details` : "Movie Details";
    refetch();
  }, [id, refetch, movie]);

  if (loadingTheater) return <Loader />;

  if (errorTheater) {
    toast.error("Error fetching theater details");
    console.error("Fetch error:", errorTheater);
    return <div>Error fetching data</div>;
  }

  return (
    <AdminLayout adminName={"Admin Name Here"}>
      <Container style={{ padding: "30px 20px" }}>
        <Row className="justify-content-center">
          <Col md={10}>
            <Card className="mb-4" style={{ display: "flex", flexDirection: "row", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", borderRadius: "10px" }}>
              <Card.Img
                variant="top"
                src={`${THEATER_IMAGES_DIR_PATH}${movie.posters}`}
                style={{ width: "300px", height: "100%", objectFit: "cover", borderRadius: "10px 0 0 10px" }}
              />
              <Card.Body style={{ padding: "20px" }}>
                <Card.Title style={{ color: "#333", fontSize: "1.75rem", fontWeight: "bold", paddingBottom: "30px", display: "flex", alignItems: "center" }}>
                  <FaTheaterMasks style={{ marginRight: "10px", verticalAlign: "middle" }} />
                  {movie.title}
                </Card.Title>
                <Card.Text style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#555" }}>
                  <FaTag style={{ marginRight: "10px" }} />
                  Genres: {movie.genres.join(', ')}
                </Card.Text>
                <Card.Text style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#555" }}>
                  <FaRegClock style={{ marginRight: "10px" }} />
                  Duration: {movie.duration} minutes
                </Card.Text>
                <Card.Text style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#555" }}>
                  <FaFileAlt style={{ marginRight: "10px" }} />
                  Description: {movie.description}
                </Card.Text>
                <Card.Text style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#555" }}>
                  <FaUserAlt style={{ marginRight: "10px" }} />
                  Casts: {movie.casts.join(', ')}
                </Card.Text>
                <Card.Text style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#555" }}>
                  <FaRegCalendarAlt style={{ marginRight: "10px" }} />
                  Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
                </Card.Text>
                <Card.Text style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#555" }}>
                  <FaGlobeAmericas style={{ marginRight: "10px" }} />
                  Languages: {movie.languages.join(', ')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default MovieDetailScreen;