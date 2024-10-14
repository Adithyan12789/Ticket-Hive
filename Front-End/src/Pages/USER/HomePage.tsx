import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import myImage from '/Vettiyan-movie-review.jpg';
import './HomePage.css';

const movies = [
  {
    title: 'Movie 1',
    posterUrl: '/234459-ARM Tovino Thomas Basil Joseph Krithi Shetty Rohini.jpg',
    description: 'An action-packed thriller that will keep you on the edge of your seat.',
    rating: '8.2/10',
    releaseDate: '2023-05-10'
  },
  {
    title: 'Movie 2',
    posterUrl: '/GEeX2aAh_400x400.jpg',
    description: 'An action-packed thriller that will keep you on the edge of your seat.',
    rating: '7.5/10',
    releaseDate: '2023-06-20'
  },
  {
    title: 'Movie 3',
    posterUrl: '/104703506.cms',
    description: 'An action-packed thriller that will keep you on the edge of your seat.',
    rating: '9.0/10',
    releaseDate: '2023-07-15'
  },
];

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="user-image-section">
        <img src={myImage} className="user-image" alt="Home Page" />
      </div>

      <Container>
        <h1 className="text-center my-4">Trending Movies</h1>
        <Row>
          {movies.map((movie, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card>
                <Card.Img variant="top" src={movie.posterUrl} alt={movie.title} />
                <Card.Body>
                  <Card.Title>{movie.title}</Card.Title>
                  <Card.Text>{movie.description}</Card.Text>
                  <Card.Text><strong>Rating:</strong> {movie.rating}</Card.Text>
                  <Card.Text><strong>Release Date:</strong> {movie.releaseDate}</Card.Text>
                  <Button variant="primary">More Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
