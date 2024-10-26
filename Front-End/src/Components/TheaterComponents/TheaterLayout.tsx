import React, { ReactNode } from 'react';
import TheaterSidebar from '../../Components/TheaterComponents/TheaterSideBar';
import { Container, Row, Col } from 'react-bootstrap';

interface TheaterOwnerLayoutProps {
  children: ReactNode;
  theaterOwnerName: string;
}

const TheaterOwnerLayout: React.FC<TheaterOwnerLayoutProps> = ({ children }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="theaterOwnersidecol">
          <TheaterSidebar />
        </Col>
        <Col md={10} className='pt-5'>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default TheaterOwnerLayout;
