import React, { useState, useEffect } from "react";
import {
  Table,
  Container,
  Row,
  Col,
  Card,
  Button,
  Form as BootstrapForm,
  Pagination,
  Modal,
} from "react-bootstrap";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";
import {
  useAdminBlockUserMutation,
  useAdminUnblockUserMutation,
} from "../../Slices/AdminApiSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Store";
import "./UserTable.css";
import { User } from "../../Types";

interface UsersTableProps {
  users: User[];
  refetchData: () => void;
}

const UserTable: React.FC<UsersTableProps> = ({ users, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(5);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin-dashboard/get-user");
    } else {
      navigate("/admin-dashboard");
    }
  }, [adminInfo, navigate]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const [blockUser] = useAdminBlockUserMutation();
  const [unblockUser] = useAdminUnblockUserMutation();

  const handleBlock = async () => {
    if (!selectedUser) return;
    try {
      await blockUser({ userId: selectedUser._id }).unwrap();
      toast.success("User blocked successfully");
      refetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    } finally {
      setShowModal(false);
    }
  };

  const handleUnblock = async (user: User) => {
    try {
      await unblockUser({ userId: user._id }).unwrap();
      toast.success("User unblocked successfully");
      refetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  console.log("currentUsers", currentUsers);
  

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-5">
            <Card.Header style={{ fontSize: "40px", fontWeight: "500" }}>
              Users Management
            </Card.Header>
            <Card.Body style={{ height: "auto" }}>
              <div className="containerS">
                <BootstrapForm>
                  <BootstrapForm.Group
                    className="mt-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <BootstrapForm.Label>Search users:</BootstrapForm.Label>
                    <BootstrapForm.Control
                      style={{ width: "500px" }}
                      value={searchQuery}
                      type="text"
                      placeholder="Enter Name or Email..."
                      onChange={handleSearch}
                    />
                  </BootstrapForm.Group>
                </BootstrapForm>
              </div>
              <br />
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user, index) => (
                        <tr key={user._id || index}>
                          <td>{user?.name}</td>
                          <td>{user?.email}</td>
                          <td>{user?.phone}</td>
                          <td>{user?.isBlocked ? "Blocked" : "Active"}</td>
                          <td>
                            <Button
                              variant={user?.isBlocked ? "outline-success" : "outline-danger"}
                              size="sm"
                              onClick={() => {
                                if (user?.isBlocked) {
                                  handleUnblock(user);
                                } else {
                                  setSelectedUser(user);
                                  setShowModal(true);
                                }
                              }}
                            >
                              {user?.isBlocked ? (
                                <><AiFillUnlock /> Unblock</>
                              ) : (
                                <><AiFillLock /> Block</>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({
                      length: Math.ceil(filteredUsers.length / usersPerPage),
                    }).map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Block User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to block {selectedUser?.name}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBlock}>
            Block User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserTable;
