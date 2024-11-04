import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useGetMovieByMovieIdQuery } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";

const USER_MOVIE_POSTER = "http://localhost:5000/MoviePosters/";
const USER_MOVIE_IMAGES = "http://localhost:5000/movieImages/";
const USER_MOVIE_CAST_IMAGES = "http://localhost:5000/CastsImages/";

const MovieDetailScreen: React.FC = () => {
  const { id } = useParams();
  const {
    data: movie,
    isLoading: loadingMovie,
    isError: errorMovie,
    refetch,
  } = useGetMovieByMovieIdQuery(id);

  useEffect(() => {
    document.title = movie ? `${movie.title} - Movie Details` : "Movie Details";
    refetch();
  }, [id, refetch, movie]);

  if (loadingMovie) return <Loader />;

  if (errorMovie) {
    toast.error("Error fetching movie details");
    console.error("Fetch error:", errorMovie);
    return <div>Error fetching data</div>;
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "500px",
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url(${USER_MOVIE_IMAGES}${movie.images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          marginBottom: "20px",
        }}
      >
        <Container
          style={{
            position: "absolute",
            top: "40px",
            left: "200px",
            zIndex: 2,
            color: "#fff",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <Row>
            <Col
              md={5}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={`${USER_MOVIE_POSTER}${movie.posters}`}
                alt={movie.title}
                style={{
                  width: "80%",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </Col>
            <Col md={7} style={{ alignContent: "center" }}>
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                {movie.title}
              </h2>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                {movie.genres.join(", ")}
              </p>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                  fontSize: "1.1rem",
                }}
              >
                {movie.languages.join(", ")} | {movie.duration} |{" "}
                {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <button
                style={{
                  backgroundColor: "#ff4081",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  marginTop: "20px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e91e63")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff4081")
                }
              >
                Book Now
              </button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container style={{ padding: "30px 20px" }}>
        <Row className="justify-content-center">
          <Col md={10}>
            <div
              style={{
                padding: "20px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <h3>About the movie</h3>
              <p style={{ color: "#555" }}>{movie.description}</p>
            </div>
          </Col>
        </Row>
      </Container>

      <Container style={{ padding: "30px 20px" }}>
        <Row className="justify-content-center text-center mb-4">
          {" "}
          {/* Add text-center here */}
          <Col md={12}>
            {" "}
            {/* Make this a separate Col to control header positioning */}
            <h3>Casts</h3>
          </Col>
        </Row>
        <Row className="justify-content-center">
          {movie.casts.map((actor: string, index: number) => (
            <Col key={index} md={3} className="text-center">
              <img
                src={`${USER_MOVIE_CAST_IMAGES}${movie.castsImages[index]}`} // Access the corresponding image using the index
                alt={actor}
                style={{
                  borderRadius: "50%", // Set borderRadius to 50% for a round image
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
                  marginBottom: "10px",
                }}
              />

              <p>{actor}</p>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default MovieDetailScreen;
