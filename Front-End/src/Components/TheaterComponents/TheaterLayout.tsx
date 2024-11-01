import React from 'react';
import TheaterSidebar from '../../Components/TheaterComponents/TheaterSideBar';
import { Container, Row, Col } from 'react-bootstrap';
import { TheaterOwnerLayoutProps } from '../../Types/TheaterTypes';

const TheaterOwnerLayout: React.FC<TheaterOwnerLayoutProps> = ({ children }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="theaterOwnersidecol">
          <TheaterSidebar />
        </Col>
        <Col md={10}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default TheaterOwnerLayout;
