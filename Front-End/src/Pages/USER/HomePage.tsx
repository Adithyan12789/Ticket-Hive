import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Carousel, Form } from "react-bootstrap";
import axios from "axios";
import "./HomePage.css";
import Footer from "../../Components/UserComponents/Footer";
import { Movie } from "../../Types/UserTypes";
import { useGetMoviesMutation } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_KEY = "0ffb386a852dbf070ac6b977313d8039";
const RECOMMENDED_API_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1;`;

const HomePage: React.FC = () => {
  const [getMovies, { isLoading: loadingTrending }] = useGetMoviesMutation();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    const fetchRecommendedMovies = async () => {
      try {
        const response = await axios.get(RECOMMENDED_API_URL);
        setRecommendedMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching recommended movies:", error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommendedMovies();
  }, []);

  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";
  const BACKDROP_BASE_URL = "http://localhost:5000/movieImages/";
  const MOVIE_IMAGES_DIR_PATH = "http://localhost:5000/MoviePosters/";

  if (loadingTrending || loadingRecommended) return <Loader />;

  const filteredMovies = trendingMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("movie id: ", filteredMovies);

  return (
    <div>
      {filteredMovies.length > 0 ? (
        <Carousel className="image-slider">
          {filteredMovies.slice(0, 5).map((movie) => (
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
                  {movie.description || "No description available"}
                </p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>No movies available</p>
      )}

      <Container>
        <div className="input-group mt-5">
          <Form.Control
            style={{border: "1px solid #008bb3"}}
            type="text"
            placeholder="Search movies by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-input-group-text"  style={{border: "1px solid #008bb3"}}>
            <FaSearch />
          </span>
        </div>
        <h1 className="text-center my-5" style={{ color: "black" }}>
          Trending Movies
        </h1>
        {filteredMovies.length > 0 ? (
          <Row>
            {filteredMovies.slice(0, 8).map((movie) => (
              <Col key={movie._id} md={3} className="mb-5">
                <Link to={`/movie-detail/${movie._id}`} style={{ textDecoration: "none" }}>
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
                      <Card.Text>
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
          <p>No trending movies found</p>
        )}

        <div className="banner-container">
          <img
            src="/tickets-stickers-badges-decorative-design-600w-2451487379-transformed.png"
            alt="Banner"
            className="banner-image"
          />
        </div>

        <h1 className="text-center my-5" style={{ color: "black" }}>
          Recommended Movies
        </h1>
        {recommendedMovies.length > 0 ? (
          <Row>
            {recommendedMovies.slice(0, 8).map((movie) => (
              <Col key={movie._id} md={3} className="mb-5">
                <Card style={{ height: "500px" }} className="movie-card">
                  <Card.Img
                    style={{ height: "300px" }}
                    variant="top"
                    src={
                      movie.poster_path
                        ? IMAGE_BASE_URL + movie.poster_path
                        : "/default-poster.jpg"
                    }
                    alt={movie.title}
                    className="movie-poster"
                  />
                  <Card.Body>
                    <Card.Title className="movie-title">
                      {movie.title}
                    </Card.Title>
                    <Card.Text>
                      <strong>Rating:</strong> {movie.vote_average}/10
                    </Card.Text>
                    <Card.Text>
                      <strong>Release Date:</strong>{" "}
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString()
                        : "N/A"}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No recommended movies found</p>
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default HomePage;
