import { useState, useEffect } from "react";
import { Button, Card, Modal, Form } from "react-bootstrap";
import {
  useGetVerificationDataQuery,
  useAdminAcceptVerificationMutation,
  useAdminRejectVerificationMutation,
} from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";
import { TheaterVerification } from "../../Types";
import { FaCheck, FaTimes, FaFileAlt } from "react-icons/fa";


const AdminVerificationScreen = () => {
  const {
    data: verifications,
    error,
    isLoading: isFetching,
    refetch,
  } = useGetVerificationDataQuery({});
  const [acceptVerification, { isLoading: isAccepting }] =
    useAdminAcceptVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] =
    useAdminRejectVerificationMutation();
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Define types for error handling
  interface FetchBaseQueryError {
    status: number;
    data: {
      message?: string;
    };
  }

  interface SerializedError {
    message: string;
  }

  useEffect(() => {
    document.title = "Admin Verification";
    refetch();
  }, [refetch]);

  const handleAccept = async (theaterId: string) => {
    try {
      await acceptVerification(theaterId);
      refetch();
      toast.success("Verification request accepted successfully");
    } catch (error) {
      console.error("Error accepting verification:", error);
      toast.error("Failed to accept verification");
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      toast.error("Rejection reason cannot be empty");
      return;
    }

    try {
      await rejectVerification({
        adminId: selectedTheaterId,
        reason: trimmedReason,
      });
      refetch();
      toast.success("Verification request rejected");
      closeRejectModal();
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast.error("Failed to reject verification");
    }
  };

  const openCertificateModal = (certificate: string) => {
    const adjustedCertificatePath = certificate.replace(
      "Back-End\\public\\",
      ""
    );
    setSelectedCertificate(adjustedCertificatePath);
    setShowCertificateModal(true);
  };

  const closeCertificateModal = () => {
    setSelectedCertificate("");
    setShowCertificateModal(false);
  };

  const openRejectModal = (theaterId: string) => {
    setSelectedTheaterId(theaterId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setSelectedTheaterId("");
    setRejectionReason("");
    setShowRejectModal(false);
  };

  if (isFetching || isAccepting || isRejecting) return <Loader />;

  if (error) {
    let errorMessage: string;

    // Type narrowing
    if ("status" in error) {
      const fetchError = error as FetchBaseQueryError;
      errorMessage =
        fetchError.data.message ||
        "An error occurred while fetching verification data.";
    } else if ("message" in error) {
      const serializedError = error as SerializedError;
      errorMessage = serializedError.message;
    } else {
      errorMessage = "An unknown error occurred.";
    }

    return <p>Error: {errorMessage}</p>;
  }

  return (
    <AdminLayout adminName={""}>
      <div>
        {verifications.length === 0 ? (
          <p>No verification requests available.</p>
        ) : (
          verifications.map((theater: TheaterVerification) => (
            <Card key={theater?._id} className="my-3 p-3 rounded">
              <Card.Body>
                <h3>{theater?.name}</h3>
                <p>Status: {theater?.verificationStatus}</p>
                {theater.certificate && (
                  <Button
                    variant="primary"
                    onClick={() =>
                      openCertificateModal(theater.certificate || "")
                    }
                  >
                    <FaFileAlt className="me-2" />
                    View Certificate
                  </Button>
                )}{" "}
                <Button
                  variant="success"
                  style={{marginRight: "5px"}}
                  onClick={() => handleAccept(theater?._id)}
                  disabled={isAccepting || isRejecting}
                >
                  {isAccepting ? (
                    <Loader />
                  ) : (
                    <>
                      <FaCheck className="me-2" /> Accept
                    </>
                  )}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => openRejectModal(theater?._id)}
                  disabled={isAccepting || isRejecting}
                >
                  {isRejecting ? (
                    <Loader />
                  ) : (
                    <>
                      <FaTimes className="me-2" /> Reject
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          ))
        )}

        <Modal
          show={showCertificateModal}
          onHide={closeCertificateModal}
          size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title>View Certificate</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCertificate && (
              <img
                src={`http://localhost:5000/${selectedCertificate}`}
                alt="Certificate Preview"
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeCertificateModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showRejectModal} onHide={closeRejectModal}>
          <Modal.Header closeButton>
            <Modal.Title>Reject Verification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="rejectionReason">
                <Form.Label>Reason for Rejection</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeRejectModal}>
              Close
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminVerificationScreen;
