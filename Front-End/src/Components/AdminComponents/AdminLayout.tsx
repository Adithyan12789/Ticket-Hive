import React from 'react';
import AdminSidebar from '../../Components/AdminComponents/AdminSideBar';
import { Container, Row, Col } from 'react-bootstrap';
import { AdminLayoutProps } from '../../Types/AdminTypes';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, adminName }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="adminsidecol">
          <AdminSidebar adminName={adminName} />
        </Col>
        <Col md={10}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
