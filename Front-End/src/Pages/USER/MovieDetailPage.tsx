import React, { useState } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useGetMovieByMovieIdQuery } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";

const USER_MOVIE_POSTER = "http://localhost:5000/MoviePosters/";
const USER_MOVIE_IMAGES = "http://localhost:5000/movieImages/";
const USER_MOVIE_CAST_IMAGES = "http://localhost:5000/CastsImages/";

const MovieDetailScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [, setSelectedLanguage] = useState<string | null>(null);

  const {
    data: movie,
    isLoading: loadingMovie,
    isError: errorMovie,
    refetch,
  } = useGetMovieByMovieIdQuery(id);

  React.useEffect(() => {
    document.title = movie ? `${movie.title} - Movie Details` : "Movie Details";
    refetch();
  }, [id, refetch, movie]);

  const handleBookNow = () => {
    if (!movie || !movie.languages.length) {
      toast.error("No languages available for this movie.");
      return;
    }
    setShowModal(true);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowModal(false);
    navigate(`/movie-theaters/${id}?language=${language}`);
  };

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
            <Col md={5}>
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
            <Col md={7}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                {movie.title}
              </h2>
              <p>{movie.genres.join(", ")}</p>
              <p>
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
                  cursor: "pointer",
                  marginTop: "20px",
                }}
                onClick={handleBookNow}
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
          <Col md={12}>
            <h3>Casts</h3>
          </Col>
        </Row>
        <Row className="justify-content-center">
          {movie.casts.map((actor: string, index: number) => (
            <Col key={index} md={3} className="text-center">
              <img
                src={`${USER_MOVIE_CAST_IMAGES}${movie.castsImages[index]}`}
                alt={actor}
                style={{
                  borderRadius: "50%",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
                  marginBottom: "10px",
                }}
              />
              <p>{actor}</p>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Language Selection Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <Modal.Header
          closeButton
          style={{
            color: "#fff",
            borderBottom: "none",
          }}
        >
          <Modal.Title style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
            Select Language
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            padding: "20px 15px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            {movie.languages.map((language: string) => (
              <Button
                key={language}
                style={{
                  backgroundColor: "rgb(147, 147, 147)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "25px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(255, 64, 129, 0.4)",
                  transition: "transform 0.3s, background-color 0.3s",
                }}
                onClick={() => handleLanguageSelect(language)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(255, 64, 129)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(147, 147, 147)")
                }
              >
                {language}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MovieDetailScreen;
