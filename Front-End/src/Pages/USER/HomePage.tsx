import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap";
import axios from "axios";
import "./HomePage.css";
import Footer from "../../Components/Footer";

// Define the type for the movie
interface Movie {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string; // Added for slider banner images
}

const API_KEY = "0ffb386a852dbf070ac6b977313d8039"; // Replace with your TMDb API key
const TRENDING_API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const RECOMMENDED_API_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
const SLIDER_API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]); // Trending Movies
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]); // Recommended Movies
  const [sliderMovies, setSliderMovies] = useState<Movie[]>([]); // Banner Movies
  const [loading, setLoading] = useState<boolean>(true); // State to handle loading for movies
  const [loadingSlider, setLoadingSlider] = useState<boolean>(true); // Loading for slider

  // Fetch movies for slider from the API
  useEffect(() => {
    const fetchSliderMovies = async () => {
      try {
        const response = await axios.get(SLIDER_API_URL);
        setSliderMovies(response.data.results); // Set the movies for slider in state
        setLoadingSlider(false); // Stop loading after data is fetched
      } catch (error) {
        console.error("Error fetching slider movies: ", error);
        setLoadingSlider(false); // Stop loading even if there is an error
      }
    };

    fetchSliderMovies();
  }, []);

  // Fetch Trending Movies
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await axios.get(TRENDING_API_URL);
        setTrendingMovies(response.data.results); // Set the trending movies in state
        setLoading(false); // Stop loading after data is fetched
      } catch (error) {
        console.error("Error fetching trending movies: ", error);
        setLoading(false); // Stop loading even if there is an error
      }
    };

    fetchTrendingMovies();
  }, []);

  // Fetch Recommended Movies
  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        const response = await axios.get(RECOMMENDED_API_URL);
        setRecommendedMovies(response.data.results); // Set the recommended movies in state
        setLoading(false); // Stop loading after data is fetched
      } catch (error) {
        console.error("Error fetching recommended movies: ", error);
        setLoading(false); // Stop loading even if there is an error
      }
    };

    fetchRecommendedMovies();
  }, []);

  // Base URLs for TMDb images
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";
  const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280/"; // For slider images

  return (
    <div>
      {/* Image slider (Carousel) */}
      {loadingSlider ? (
        <p>Loading slider...</p>
      ) : (
        <Carousel className="image-slider">
          {sliderMovies.slice(10, 15).map((movie) => (
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
        {/* Trending Movies Section */}
        <h1 className="text-center my-5" style={{color:"black"}}>Trending Movies</h1>
        {loading ? (
          <p>Loading trending movies...</p>
        ) : (
          <Row>
            {trendingMovies.slice(0, 8).map((movie) => (
              <Col key={movie.id} md={3} className="mb-5">
                <Card className="movie-card">
                  <Card.Img
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
                    <Button className="book-now-btn">Book Now</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Image Banner before Recommended Movies Section */}
        <div className="banner-container">
          <img
            src="/tickets-stickers-badges-decorative-design-600w-2451487379-transformed.png" // Replace with your banner image URL or path
            alt="Banner"
            className="banner-image"
          />
        </div>

        {/* Recommended Movies Section */}
        <h1 className="text-center my-5" style={{color:"black"}}>Recommended Movies</h1>
        {loading ? (
          <p>Loading recommended movies...</p>
        ) : (
          <Row>
            {recommendedMovies.slice(0, 8).map((movie) => (
              <Col key={movie.id} md={3} className="mb-5">
                <Card className="movie-card">
                  <Card.Img
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
                    <Button className="book-now-btn">Book Now</Button>
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
