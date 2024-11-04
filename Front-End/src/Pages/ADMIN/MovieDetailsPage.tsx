import { useEffect } from "react";
import { Container, Carousel, Row, Col } from "react-bootstrap";
import { FaFileAlt, FaTheaterMasks, FaRegClock, FaRegCalendarAlt, FaGlobeAmericas, FaUserAlt, FaTag, FaFilm } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetMovieByMovieIdQuery } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";

const THEATER_IMAGES_DIR_PATH = "http://localhost:5000/movieImages/";

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
    toast.error("Error fetching movie details");
    console.error("Fetch error:", errorTheater);
    return <div>Error fetching data</div>;
  }

  console.log("movie.images: ", movie.images);
  

  return (
    <AdminLayout adminName={"Admin Name Here"}>
      <Container style={{ padding: "30px 20px" }}>
        <Row className="justify-content-center">
          <Col md={10}>
            <Carousel className="mb-4">
              {movie.images.map((image: string, index: number) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100"
                    src={`${THEATER_IMAGES_DIR_PATH}${image}`}
                    alt={`Slide ${index + 1}`}
                    style={{ height: "400px", objectFit: "cover", borderRadius: "10px" }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            <div style={{ padding: "20px", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", borderRadius: "10px", backgroundColor: "#fff" }}>
              <h2 style={{ color: "#333", fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
                <FaTheaterMasks style={{ marginRight: "10px" }} />
                {movie.title}
              </h2>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaTag style={{ marginRight: "10px" }} />
                Genres: {movie.genres.join(', ')}
              </p>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaRegClock style={{ marginRight: "10px" }} />
                Duration: {movie.duration} minutes
              </p>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaFileAlt style={{ marginRight: "10px" }} />
                Description: {movie.description}
              </p>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaUserAlt style={{ marginRight: "10px" }} />
                Casts: {movie.casts.join(', ')}
              </p>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaFilm style={{ marginRight: "10px" }} />
                Director: {movie.director}
              </p>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaRegCalendarAlt style={{ marginRight: "10px" }} />
                Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
              </p>
              <p style={{ display: "flex", alignItems: "center", marginBottom: "15px", color: "#555" }}>
                <FaGlobeAmericas style={{ marginRight: "10px" }} />
                Languages: {movie.languages.join(', ')}
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default MovieDetailScreen;
