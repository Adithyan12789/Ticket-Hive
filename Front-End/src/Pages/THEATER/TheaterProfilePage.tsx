import { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Image,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import { setTheaterDetails } from "../../Slices/TheaterAuthSlice";
import {
  useGetTheaterOwnerProfileQuery,
  useUpdateTheaterOwnerMutation,
} from "../../Slices/TheaterApiSlice";
import { TheaterInfo } from "../../Types/TheaterTypes";
import TheaterProfileSidebar from "../../Components/TheaterComponents/TheaterProfileSidebar";
import "./TheaterProfilePage.css";

const PROFILE_IMAGE_DIR_PATH = "http://localhost:5000/TheaterProfileImages/";
const DEFAULT_PROFILE_IMAGE = "/profileImage_1729749713837.jpg";

const TheaterProfileScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const dispatch = useDispatch();
  const { TheaterInfo } = useSelector(
    (state: { theaterAuth: { TheaterInfo: TheaterInfo } }) => state.theaterAuth
  );
  const theaterOwnerId = TheaterInfo?.id;
  const {
    data: theaterProfile,
    isLoading: profileLoading,
    refetch,
  } = useGetTheaterOwnerProfileQuery(theaterOwnerId);
  const [updateTheaterProfile, { isLoading }] = useUpdateTheaterOwnerMutation();

  useEffect(() => {
    document.title = "Ticket Hive - Profile";
    if (theaterProfile) {
      setName(theaterProfile.name);
      setPhone(theaterProfile.phone || "");
      setProfileImage(theaterProfile.profileImageName);
    }
  }, [theaterProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image")) {
        toast.error("Please select an image file.");
        return;
      }
      setProfileImage(file);
    }
  };

  const validateName = (name: string) => {
    if (name.trim() === "") {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (phone.trim() === "") {
      toast.error("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      toast.error("Phone number is not valid");
      return false;
    }
    return true;
  };

  const validatePassword = (password: string) => {
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one letter, one number, and one special character."
      );
      return false;
    }
    return true;
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(name) || !validatePhone(phone)) {
      toast.error("Invalid name or phone number");
      return;
    }

    if (
      newPassword &&
      (newPassword !== confirmPassword || !validatePassword(newPassword))
    ) {
      toast.error(
        "Passwords do not match or do not meet the required criteria"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (newPassword) formData.append("password", newPassword);
      formData.append("currentPassword", currentPassword);
      if (profileImage) formData.append("profileImage", profileImage);

      const responseFromApiCall = await updateTheaterProfile(formData).unwrap();

      await refetch();

      dispatch(setTheaterDetails(responseFromApiCall));

      toast.success("Theater Owner Profile Updated Successfully");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "An error occurred"
      );
    }
  };

  if (profileLoading) return <Loader />;

  return (
    <div className="profile-screen">
      <Container fluid className="profile-container mt-4">
        <Row className="my-4 justify-content-center">
          <Col md={3} className="sidebar-column">
            <TheaterProfileSidebar />
          </Col>
          <Col md={8}>
            <Card className="profile-card-modern shadow-sm">
              <Card.Body className="text-center">
                <div className="profile-photo-container text-center mb-4">
                  <Image
                    src={
                      theaterProfile?.profileImageName
                        ? `${PROFILE_IMAGE_DIR_PATH}${theaterProfile.profileImageName}`
                        : DEFAULT_PROFILE_IMAGE
                    }
                    alt="Profile"
                    roundedCircle
                    className="profile-photo-modern"
                  />
                </div>
                <div className="profile-details-modern text-center">
                  <h4 className="profile-name-modern">
                    {theaterProfile?.name}
                  </h4>
                  <p className="profile-email-modern">
                    {theaterProfile?.email}
                  </p>
                  <p className="profile-phone-modern">
                    {theaterProfile?.phone || "N/A"}
                  </p>
                </div>
                <div className="text-center mt-4">
                  <Button
                    onClick={() => setShowModal(true)}
                    className="profile-edit-button-modern"
                  >
                    Edit Profile
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Control
                type="text"
                placeholder={theaterProfile?.name || "Enter name"}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="phone">
              <Form.Control
                type="text"
                placeholder={theaterProfile?.phone || "Enter phone number"}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Control
                type="password"
                placeholder="Enter current password"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Control
                type="password"
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="profileImage">
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>
            <Button type="submit" className="profile-button-modern">
              {isLoading ? <Loader /> : "Update Profile"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TheaterProfileScreen;
