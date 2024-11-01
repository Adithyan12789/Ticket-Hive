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
    useAdminBlockTheaterOwnerMutation,
    useAdminUnblockTheaterOwnerMutation,
} from "../../Slices/AdminApiSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Store";
import "./UserTable.css";
import { Theater, TheaterOwnersTableProps } from "../../Types/TheaterTypes";

const TheaterOwnerTable: React.FC<TheaterOwnersTableProps> = ({ theaterOwners, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [TheaterOwnersPerPage] = useState<number>(5);
  const [selectedTheaterOwner, setSelectedTheaterOwner] = useState<Theater | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/get-theaterOwner");
    } else {
      navigate("/admin/dashboard");
    }
  }, [adminInfo, navigate]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredTheaterOwners = theaterOwners.filter(
    (theaterOwners) =>
        theaterOwners.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theaterOwners.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastTheaterOwners = currentPage * TheaterOwnersPerPage;
  const indexOfFirstTheaterOwners = indexOfLastTheaterOwners - TheaterOwnersPerPage;
  const currentTheaterOwners = filteredTheaterOwners.slice(indexOfFirstTheaterOwners, indexOfLastTheaterOwners);

  const [blockTheaterOwner] = useAdminBlockTheaterOwnerMutation();
  const [unblockTheaterOwner] = useAdminUnblockTheaterOwnerMutation();

  const handleBlock = async () => {
    if (!selectedTheaterOwner) return;
    try {
      console.log("first,          efsgsfsdfsdfsdfw54534536463wf");
      
      await blockTheaterOwner({ theaterOwnerId: selectedTheaterOwner._id }).unwrap();
      toast.success("Theater Owner blocked successfully");
      refetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    } finally {
      setShowModal(false);
    }
  };

  const handleUnblock = async (TheaterOwners: Theater) => {
    try {
      await unblockTheaterOwner({ theaterOwnerId: TheaterOwners._id }).unwrap();
      toast.success("Theater Owner unblocked successfully");
      refetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  console.log("currentTheaterOwners", currentTheaterOwners);
  

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-5">
            <Card.Header style={{ fontSize: "40px", fontWeight: "500" }}>
            Theater Owners Management
            </Card.Header>
            <Card.Body style={{ height: "auto" }}>
              <div className="containerS">
                <BootstrapForm>
                  <BootstrapForm.Group
                    className="mt-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <BootstrapForm.Label>Search theater Owners:</BootstrapForm.Label>
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
                    {currentTheaterOwners.length > 0 ? (
                      currentTheaterOwners.map((theaterOwner, index) => (
                        <tr key={theaterOwner._id || index}>
                          <td>{theaterOwner?.name}</td>
                          <td>{theaterOwner?.email}</td>
                          <td>{theaterOwner?.phone}</td>
                          <td>{theaterOwner?.isBlocked ? "Blocked" : "Active"}</td>
                          <td>
                            <Button
                              variant={theaterOwner?.isBlocked ? "outline-success" : "outline-danger"}
                              size="sm"
                              onClick={() => {
                                if (theaterOwner?.isBlocked) {
                                  handleUnblock(theaterOwner);
                                } else {
                                  setSelectedTheaterOwner(theaterOwner);
                                  setShowModal(true);
                                }
                              }}
                            >
                              {theaterOwner?.isBlocked ? (
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
                          No Theater Owners found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({
                      length: Math.ceil(filteredTheaterOwners.length / TheaterOwnersPerPage),
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
          <Modal.Title>Confirm Block Theater Owner </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to block {selectedTheaterOwner?.name}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBlock}>
            Block Theater Owner
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TheaterOwnerTable;
