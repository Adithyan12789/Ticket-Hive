import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Carousel, Form } from "react-bootstrap";
import axios from "axios";
import "./HomePage.css";
import Footer from "../../Components/UserComponents/Footer";
import { Movie } from "../../Types/UserTypes";
import { useGetMoviesMutation } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { FaSearch } from "react-icons/fa";

const API_KEY = "0ffb386a852dbf070ac6b977313d8039";
const RECOMMENDED_API_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
const SLIDER_API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;

const HomePage: React.FC = () => {
  const [getMovies, { isLoading }] = useGetMoviesMutation();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [sliderMovies, setSliderMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSlider, setLoadingSlider] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  console.log("getMovies: ", getMovies);

  useEffect(() => {
    const fetchSliderMovies = async () => {
      try {
        const response = await axios.get(SLIDER_API_URL);
        setSliderMovies(response.data.results);
        setLoadingSlider(false);
      } catch (error) {
        console.error("Error fetching slider movies: ", error);
        setLoadingSlider(false);
      }
    };

    fetchSliderMovies();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await getMovies({}).unwrap();
      setTrendingMovies(response.movies || []);
    } catch (err) {
      console.error("Error fetching movies", err);
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommended movies: ", error);
        setLoading(false);
      }
    };

    fetchRecommendedMovies();
  }, []);

  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";
  const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280/";
  const MOVIE_IMAGES_DIR_PATH = "http://localhost:5000/MoviePosters/";

  console.log("Movies", trendingMovies);

  if (isLoading || loading) return <Loader />;

  const filteredMovies = trendingMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {loadingSlider ? (
        <p>Loading slider...</p>
      ) : (
        <Carousel className="image-slider">
          {sliderMovies.slice(0, 5).map((movie) => (
            <Carousel.Item key={movie.id}>
              <img
                className="d-block w-100 slider-image"
                src={
                  movie.backdrop_path
                    ? BACKDROP_BASE_URL + movie.backdrop_path
                    : "/default-banner.jpg"
                }
                alt={movie.title}
              />
              <Carousel.Caption>
                <h3>{movie.title}</h3>
                <p>{movie.overview}</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      <Container>
        <div className="input-group">
          <Form.Control
            type="text"
            placeholder="Search movies by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-input-group-text">
            <FaSearch />
          </span>
        </div>
        <h1 className="text-center my-5" style={{ color: "black" }}>
          Trending Movies
        </h1>
        {loading ? (
          <p>Loading trending movies...</p>
        ) : (
          <Row>
            {filteredMovies.slice(0, 8).map((movie) => (
              <Col key={movie.id} md={3} className="mb-5">
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
                      {movie.genres.join(", ")}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
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
        {loading ? (
          <p>Loading recommended movies...</p>
        ) : (
          <Row>
            {recommendedMovies.slice(0, 8).map((movie) => (
              <Col key={movie.id} md={3} className="mb-5">
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
                      <strong>Release Date:</strong> {movie.releaseDate}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Footer />
    </div>
  );
};

export default HomePage;
