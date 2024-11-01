import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import axios from "axios";
import "./HomePage.css";
import Footer from "../../Components/UserComponents/Footer";
import { Movie } from "../../Types/UserTypes";

const API_KEY = "0ffb386a852dbf070ac6b977313d8039";
const TRENDING_API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const RECOMMENDED_API_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
const SLIDER_API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [sliderMovies, setSliderMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSlider, setLoadingSlider] = useState<boolean>(true);

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

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await axios.get(TRENDING_API_URL);
        setTrendingMovies(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending movies: ", error);
        setLoading(false);
      }
    };

    fetchTrendingMovies();
  }, []);

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
        <h1 className="text-center my-5" style={{color:"black"}}>Trending Movies</h1>
        {loading ? (
          <p>Loading trending movies...</p>
        ) : (
          <Row>
            {trendingMovies.slice(0, 8).map((movie) => (
              <Col key={movie.id} md={3} className="mb-5">
                <Card style={{height: "500px"}} className="movie-card">
                  <Card.Img
                  style={{height: "300px"}}
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
                      <strong>Release Date:</strong> {movie.release_date}
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

        <h1 className="text-center my-5" style={{color:"black"}}>Recommended Movies</h1>
        {loading ? (
          <p>Loading recommended movies...</p>
        ) : (
          <Row>
            {recommendedMovies.slice(0, 8).map((movie) => (
              <Col key={movie.id} md={3} className="mb-5">
                <Card style={{height: "500px"}} className="movie-card">
                  <Card.Img
                  style={{height: "300px"}}
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
                      <strong>Release Date:</strong> {movie.release_date}
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
