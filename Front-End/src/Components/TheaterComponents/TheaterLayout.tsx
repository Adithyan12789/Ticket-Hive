import React, { ReactNode } from 'react';
import TheaterSidebar from '../../Components/TheaterComponents/TheaterSideBar';
import { Container, Row, Col } from 'react-bootstrap';

interface TheaterOwnerLayoutProps {
  children: ReactNode;
  theaterOwnerName: string;
}

const TheaterOwnerLayout: React.FC<TheaterOwnerLayoutProps> = ({ children, theaterOwnerName }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="theaterOwnersidecol">
          <TheaterSidebar theaterOwnerName={theaterOwnerName} />
        </Col>
        <Col md={10}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default TheaterOwnerLayout;
