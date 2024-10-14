import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-dark text-white py-4">
      <Container>
        <Row>
          <Col md={4} className="text-center text-md-left mb-3 mb-md-0">
            <h5>Ticket Hive</h5>
            <p>Your favorite movie ticket booking site.</p>
          </Col>
          <Col md={4} className="text-center mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Home</a></li>
              <li><a href="/movies" className="text-white">Movies</a></li>
              <li><a href="/contact" className="text-white">Contact Us</a></li>
            </ul>
          </Col>
          <Col md={4} className="text-center text-md-right">
            <h5>Follow Us</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-white">Facebook</a></li>
              <li><a href="#" className="text-white">Instagram</a></li>
              <li><a href="#" className="text-white">Twitter</a></li>
            </ul>
          </Col>
        </Row>
        <div className="text-center mt-3">
          <p>&copy; {new Date().getFullYear()} Ticket Hive. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
