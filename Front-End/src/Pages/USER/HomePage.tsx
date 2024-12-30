import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Carousel,
  Form,
  InputGroup,
} from "react-bootstrap";
import "./HomePage.css";
import Footer from "../../Components/UserComponents/Footer";
import { MovieManagement } from "../../Types/MoviesTypes";
import { useGetMoviesMutation } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { FaSearch, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const [getMovies, { isLoading: loadingTrending }] = useGetMoviesMutation();
  const [trendingMovies, setTrendingMovies] = useState<MovieManagement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await getMovies({}).unwrap();
      setTrendingMovies(response.movies || []);
    } catch (err) {
      console.error("Error fetching trending movies", err);
    }
  }, [getMovies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const BACKDROP_BASE_URL = "https://tickethive.fun/movieImages/";
  const MOVIE_IMAGES_DIR_PATH = "https://tickethive.fun/MoviePosters/";

  const filteredTrendingMovies = trendingMovies
    .filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by recently added (createdAt)
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return dateB - dateA;
    });

  const filteredRecommendedMovies = trendingMovies
    .filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      return (b.averageRating || 0) - (a.averageRating || 0);
    });

  if (loading || loadingTrending) return <Loader />;

  return (
    <div>
      {filteredTrendingMovies.length > 0 ? (
        <Carousel className="image-slider">
          {filteredTrendingMovies.slice(0, 5).map((movie) => (
            <Carousel.Item key={movie._id}>
              <Link to={`/movie-detail/${movie._id}`}>
                <img
                  className="d-block w-100 slider-image"
                  src={
                    movie.images && movie.images.length > 0
                      ? BACKDROP_BASE_URL + movie.images[1]
                      : "/default-banner.jpg"
                  }
                  alt={movie.title}
                />
              </Link>
              <Carousel.Caption
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "5px",
                  padding: "10px",
                }}
              >
                <h3 style={{ color: "#fff" }}>{movie.title}</h3>
                <p style={{ color: "#fff" }}>
                  {movie.description
                    ? movie.description.length > 200
                      ? movie.description.slice(0, 200) + "..."
                      : movie.description
                    : "No description available"}
                </p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>No movies available</p>
      )}

      <Container>
        <div
          className="d-flex mt-5"
          style={{ gap: "0.5rem", justifyContent: "space-evenly" }}
        >
          {/* Search Bar on the Right with Limited Width */}
          <InputGroup style={{ maxWidth: "700px", flexGrow: 1 }}>
            <Form.Control
              style={{
                border: "1px solid #008bb3",
                borderRadius: "0.5rem 0 0 0.5rem",
                paddingLeft: "2.5rem",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              }}
              type="text"
              placeholder="Search movies by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <InputGroup.Text
              className="search-icon"
              style={{
                backgroundColor: "#008bb3",
                borderRadius: "0 0.5rem 0.5rem 0",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "0.5rem 1rem",
                height: "50px",
              }}
            >
              <FaSearch />
            </InputGroup.Text>
          </InputGroup>
        </div>
        {/* Trending Movies Section */}
        <h1 className="text-center my-5" style={{ color: "rgb(0, 123, 255)" }}>
          Trending Movies
        </h1>

        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ marginRight: "20px" }}
        >
          <div></div> {/* Empty div to maintain space */}
          {filteredTrendingMovies.length > 4 && (
            <div className="text-end">
              <Link
                to="/allMovies"
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  color: "#007BFF",
                  display: "inline-flex",
                  alignItems: "center",
                  transition: "transform 0.3s ease, color 0.3s ease",
                }}
                className="hover-link"
              >
                See All
                <span
                  style={{
                    marginLeft: "5px",
                    fontSize: "1.2rem",
                    display: "inline-block",
                    transition: "transform 0.3s ease",
                  }}
                  className="arrow-icon"
                >
                  →
                </span>
              </Link>
            </div>
          )}
        </div>

        {filteredTrendingMovies.length > 0 ? (
          <>
            <Row>
              {filteredTrendingMovies.slice(0, 4).map((movie) => (
                <Col key={movie._id} md={3} className="mb-5">
                  <Link
                    to={`/movie-detail/${movie._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Card style={{ height: "500px" }} className="movie-card">
                      <Card.Img
                        style={{ height: "350px" }}
                        variant="top"
                        src={
                          movie.posters
                            ? MOVIE_IMAGES_DIR_PATH + movie.posters
                            : "/default-poster.jpg"
                        }
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <Card.Body>
                        <Card.Title className="movie-title">
                          {movie.title}
                        </Card.Title>
                        <Card.Text style={{ fontSize: "13px" }}>
                          {movie.genres && movie.genres.length > 0
                            ? movie.genres.join(", ")
                            : "Genres not available"}
                        </Card.Text>
                        <Card.Text>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <FaStar
                              style={{ color: "#f39c12", marginRight: "5px" }}
                            />
                            <span>{movie.averageRating}/10</span>
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <p>No trending movies found</p>
        )}

        <div className="banner-container">
          <Carousel>
            <Carousel.Item>
              <img
                className="d-block w-100 banner-image"
                src="/imgu3.webp"
                alt="First Slide"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 banner-image"
                src="/imgh2.webp"
                alt="Second Slide"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 banner-image"
                src="/imgb.webp"
                alt="Third Slide"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 banner-image"
                src="/tickets-stickers-badges-decorative-design-600w-2451487379-transformed.png"
                alt="Fourth Slide"
                style={{
                  objectFit: "cover"
                }}
              />
            </Carousel.Item>
          </Carousel>
        </div>

        <h1
          className="text-center my-5 text-primary"
          style={{ color: "black" }}
        >
          Recommended Movies
        </h1>

        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ marginRight: "20px" }}
        >
          <div></div> {/* Empty div to maintain space */}
          {filteredRecommendedMovies.length > 4 && (
            <div className="text-end">
              <Link
                to="/allMovies"
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  color: "#007BFF",
                  display: "inline-flex",
                  alignItems: "center",
                  transition: "transform 0.3s ease, color 0.3s ease",
                }}
                className="hover-link"
              >
                See All
                <span
                  style={{
                    marginLeft: "5px",
                    fontSize: "1.2rem",
                    display: "inline-block",
                    transition: "transform 0.3s ease",
                  }}
                  className="arrow-icon"
                >
                  →
                </span>
              </Link>
            </div>
          )}
        </div>

        {filteredRecommendedMovies.length > 0 ? (
          <>
            <Row>
              {filteredRecommendedMovies.slice(4, 8).map((movie) => (
                <Col key={movie._id} md={3} className="mb-5">
                  <Link
                    to={`/movie-detail/${movie._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Card style={{ height: "500px" }} className="movie-card">
                      <Card.Img
                        style={{ height: "350px" }}
                        variant="top"
                        src={
                          movie.posters
                            ? MOVIE_IMAGES_DIR_PATH + movie.posters
                            : "/default-poster.jpg"
                        }
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <Card.Body>
                        <Card.Title className="movie-title">
                          {movie.title}
                        </Card.Title>
                        <Card.Text style={{ fontSize: "13px" }}>
                          {movie.genres && movie.genres.length > 0
                            ? movie.genres.join(", ")
                            : "Genres not available"}
                        </Card.Text>
                        <Card.Text>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <FaStar
                              style={{ color: "#f39c12", marginRight: "5px" }}
                            />
                            <span>{movie.averageRating}/10</span>
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <p>No recommended movies found</p>
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default HomePage;
