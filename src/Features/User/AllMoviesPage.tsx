import React, { useState } from "react";
import { Row, Col, Card, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useGetMoviesQuery } from "../../Store/UserApiSlice";
import Loader from "./Loader";
import { MovieManagement } from "../../Core/MoviesTypes";
import { backendUrl } from "../../url";

const MOVIE_IMAGES_DIR_PATH = `${backendUrl}/MoviePosters/`;

const AllMoviesPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, isLoading } = useGetMoviesQuery(undefined);
  const movies = data?.movies || [];

  const languages = [
    ...new Set(movies.flatMap((movie: MovieManagement) => movie.languages || [])),
  ];

  const genres = [
    ...new Set(movies.flatMap((movie: MovieManagement) => movie.genres || [])),
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchesLanguage = !selectedLanguage || movie.languages.includes(selectedLanguage);
    const matchesGenre = !selectedGenre || movie.genres.includes(selectedGenre);
    const matchesSearch = !searchTerm || movie.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLanguage && matchesGenre && matchesSearch;
  });

  // if (isLoading) return <Loader />;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px", color: "rgb(0, 123, 255)" }}>
        All Movies
      </h1>

      <Row style={{ marginBottom: "30px" }}>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: "8px",
                padding: "10px",
                fontSize: "16px",
                borderColor: "#ccc",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            />
          </InputGroup>
        </Col>

        {/* Language Filter */}
        <Col md={4}>
          <Form.Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
              borderColor: "#ccc",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <option value="">Filter by Language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Genre Filter */}
        <Col md={4}>
          <Form.Select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
              borderColor: "#ccc",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <option value="">Filter by Genre</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Movies List */}
      {filteredMovies.length > 0 ? (
        <Row>
          {filteredMovies.map((movie) => (
            <Col key={movie._id} md={3} style={{ marginBottom: "30px" }}>
              <Link
                to={`/movie-detail/${movie._id}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  color: "inherit",
                }}
              >
                <Card
                  style={{
                    height: "500px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s ease",
                    overflow: "hidden",
                  }}
                  className="movie-card"
                >
                  <Card.Img
                    variant="top"
                    src={
                      movie.posters
                        ? `${MOVIE_IMAGES_DIR_PATH}${movie.posters}`
                        : "/default-poster.jpg"
                    }
                    alt={movie.title}
                    style={{
                      height: "350px",
                      objectFit: "cover",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                    }}
                  />
                  <Card.Body style={{ padding: "15px" }}>
                    <Card.Title
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "10px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {movie.title}
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1rem", color: "#555" }}>
                      {movie.genres && movie.genres.length > 0
                        ? movie.genres.join(", ")
                        : "Genres not available"}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      ) : (
        <p style={{ textAlign: "center", color: "#555" }}>
          No movies found with the selected filters.
        </p>
      )}
    </div>
  );
};

export default AllMoviesPage;
