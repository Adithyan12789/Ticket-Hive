import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0 text-center">
            <h5>Ticket Hive</h5>
            <p className="footer-text">Your go-to platform for easy and quick movie ticket bookings.</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0 text-center">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/movies" className="footer-link">Movies</a></li>
              <li><a href="/contact" className="footer-link">Contact Us</a></li>
            </ul>
          </Col>
          <Col md={4} className="text-md-right text-center">
            <h5>Follow Us</h5>
            <ul className="list-unstyled social-links">
              <li><a href="#" className="footer-link">Facebook</a></li>
              <li><a href="#" className="footer-link">Instagram</a></li>
              <li><a href="#" className="footer-link">Twitter</a></li>
            </ul>
          </Col>
        </Row>
        <div className="text-center mt-4">
          <p className="footer-text">&copy; {new Date().getFullYear()} Ticket Hive. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
