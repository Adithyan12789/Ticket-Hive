import React from "react";
import { Table, Container, Row, Col, Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./UserTable.css";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;  // Added phone number
  otp: string;          // Added OTP
}

interface UsersTableProps {
  users: User[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { adminInfo } = useSelector((state: any) => state.adminAuth);
  const navigate = useNavigate();

  // Redirect to the login page if the admin is not authenticated
  React.useEffect(() => {
    if (adminInfo) {
      navigate("/admin-dashboard/admin-get-user");
    } else {
      navigate("/admin-login");
    }
  }, [adminInfo, navigate]);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-3 shadow-sm border-0 rounded">
            <Card.Header className="bg-primary text-white">Users</Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table responsive striped bordered hover className="table-modern">
                  <thead className="thead-dark">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>OTP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>{user.otp}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
