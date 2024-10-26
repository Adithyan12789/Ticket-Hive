import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Button,
  Form,
  Container,
  Card,
  Modal,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import Swal from 'sweetalert2';
import {
  useAddTheaterMutation,
  useGetTheatersMutation,
  useUpdateTheaterMutation,
  useDeleteTheaterMutation,
} from "../../Slices/TheaterApiSlice";
import { toast } from "react-toastify";
import { FaSearch, FaEdit, FaCheck, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import TheaterOwnerLayout from "../../Components/TheaterComponents/TheaterLayout";
import Loader from "../../Components/UserComponents/Loader";
import { TheaterManagement } from "../../Types";
import "./TheaterManagement.css";

const THEATER_IMAGES_DIR_PATH = "http://localhost:5000/TheatersImages/";
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";

const AddTheaterScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedTheater, setSelectedTheater] =
    useState<TheaterManagement | null>(null);
  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [theaters, setTheaters] = useState<TheaterManagement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addTheater] = useAddTheaterMutation();
  const [updateTheater] = useUpdateTheaterMutation();
  const [deleteTheater] = useDeleteTheaterMutation();
  const navigate = useNavigate();
  const [getTheaters, { isLoading }] = useGetTheatersMutation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(3);

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => {
    setShowModal(false);
    resetFormFields();
  };

  const resetFormFields = () => {
    setName("");
    setCity("");
    setAddress("");
    setDescription("");
    setAmenities([""]);
    setLatitude("");
    setLongitude("");
    setSelectedImages([]);
  };

  const handleEditModalShow = (theater: TheaterManagement) => {
    setSelectedTheater(theater);
    setName(theater.name);
    setCity(theater.city);
    setAddress(theater.address);
    setDescription(theater.description);
    setAmenities(theater.amenities);
    setLatitude(theater.latitude);
    setLongitude(theater.longitude);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    resetFormFields();
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const response = await getTheaters({}).unwrap();
      setTheaters(response);
    } catch (err) {
      console.error("Error fetching theaters", err);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedImages(validImages);
  };

  const handleAmenitiesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amenitiesArray = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setAmenities(amenitiesArray);
  };

  const handleDelete = async (theaterId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      try {
        navigate("/theater/management");
        await deleteTheater({ id: theaterId }).unwrap();  
        toast.success("Theater deleted successfully");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const validateName = (value: string) => /^[A-Za-z0-9\s'-]+$/.test(value);

  const validateCity = (value: string) => /^[A-Za-z\s'-]+$/.test(value);

  const validateCoordinates = (lat: string, lng: string) => {
    const latRegex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/;
    const lngRegex = /^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/;
    return latRegex.test(lat) && lngRegex.test(lng);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();
    const trimmedDescription = description.trim();
    const trimmedAmenities = amenities.map((item) => item.trim()).join(", ");
    const trimmedLatitude = latitude.trim();
    const trimmedLongitude = longitude.trim();

    if (
      !trimmedName ||
      !trimmedCity ||
      !trimmedAddress ||
      !selectedImages.length ||
      !trimmedDescription ||
      !trimmedAmenities ||
      !trimmedLatitude ||
      !trimmedLongitude
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!validateName(trimmedName)) {
      toast.error("Invalid characters in name");
      return;
    }

    if (!validateCity(trimmedCity)) {
      toast.error("Invalid characters in city");
      return;
    }

    if (!validateCoordinates(trimmedLatitude, trimmedLongitude)) {
      toast.error("Invalid latitude or longitude");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("city", trimmedCity);
      formData.append("address", trimmedAddress);
      formData.append("description", trimmedDescription);
      formData.append("amenities", trimmedAmenities);
      formData.append("latitude", trimmedLatitude);
      formData.append("longitude", trimmedLongitude);
      selectedImages.forEach((image) => formData.append("images", image));

      await addTheater(formData);
      toast.success("Theater added successfully");
      handleModalClose();
      navigate("/theater/management");
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const lat = typeof latitude === "string" ? latitude.trim() : "";
    const long = typeof longitude === "string" ? longitude.trim() : "";

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("city", city.trim());
    formData.append("address", address.trim());
    formData.append("description", description.trim());
    amenities.forEach((amenity) => formData.append("amenities[]", amenity));
    formData.append("latitude", lat);
    formData.append("longitude", long);
    selectedImages.forEach((image) => formData.append("images", image));

    try {
      setLoading(true);
      if (selectedTheater) {
        await updateTheater({ id: selectedTheater._id, formData }).unwrap();
        toast.success("Theater updated successfully");
        handleEditModalClose();
      } else {
        await addTheater(formData).unwrap();
        toast.success("Theater added successfully");
        handleModalClose();
      }

      const response = await getTheaters({}).unwrap();
      setTheaters(response);
      navigate("/theater/management");
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) return <Loader />;

  const filteredTheaters = theaters.filter((theater) =>
    theater.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastTheater = currentPage * itemsPerPage;
  const indexOfFirstTheater = indexOfLastTheater - itemsPerPage;
  const currentTheaters = filteredTheaters.slice(
    indexOfFirstTheater,
    indexOfLastTheater
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredTheaters.length / itemsPerPage);

  return (
    <TheaterOwnerLayout theaterOwnerName="John Doe">
      <Container
        className="px-5 w-78"
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <Row className="justify-content-between align-items-center mb-3">
          <Col md={6} className="d-flex">
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Search theaters by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-input-group-text">
                <FaSearch />
              </span>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="primary" onClick={handleModalShow}>
              Add Theater
            </Button>
          </Col>
        </Row>

        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Theater</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter theater name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="city" className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="images" className="mb-3">
                    <Form.Label>Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleImageChange}
                    />
                    <div className="mt-3">
                      {selectedImages.map((image, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(image)}
                          alt="preview"
                          className="img-thumbnail"
                          style={{ width: "150px", marginRight: "10px" }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="amenities" className="mb-3">
                    <Form.Label>Amenities</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter amenities separated by commas"
                      value={amenities.join(", ")}
                      onChange={handleAmenitiesChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="latitude" className="mb-3">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="longitude" className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={showEditModal}
          onHide={handleEditModalClose}
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Theater</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter theater name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="city" className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="amenities" className="mb-3">
                    <Form.Label>Amenities</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter amenities separated by commas"
                      value={amenities.join(", ")}
                      onChange={handleAmenitiesChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="latitude" className="mb-3">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="longitude" className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="images" className="mb-3">
                    <Form.Label>Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleImageChange}
                    />
                    <div className="mt-3">
                      {selectedImages.map((image, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(image)}
                          alt="preview"
                          className="img-thumbnail"
                          style={{ width: "150px", marginRight: "10px" }}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={showEditModal}
          onHide={handleEditModalClose}
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Theater</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Theater Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter theater name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amenities</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter amenities (comma-separated)"
                  value={amenities.join(", ")}
                  onChange={handleAmenitiesChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formFileMultiple" className="mb-3">
                <Form.Label>Theater Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                {loading ? "Saving..." : "Save Theater"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Row>
          {currentTheaters.length === 0 ? (
            <Col className="text-center">No theaters found.</Col>
          ) : (
            currentTheaters.map((theater) => (
              <Col key={theater._id} md={4} className="mb-4">
                <Link
                  to={`/theater/details/${theater?._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Card style={{ height: "450px" }}>
                    <Card.Img
                      variant="top"
                      src={
                        theater.images.length > 0
                          ? `${THEATER_IMAGES_DIR_PATH}${theater.images[0]}`
                          : DEFAULT_THEATER_IMAGE
                      }
                      alt={theater.name}
                    />
                    <Card.Body>
                      <Card.Title>{theater.name}</Card.Title>
                      <Card.Text>{theater.description}</Card.Text>
                      <div className="button-group" >
                        <Button
                          variant="danger"
                          className="icon-button"
                          onClick={() => handleDelete(theater._id)}
                        >
                          <FaTrash />
                        </Button>

                        <Link to={`/theater/edit/${theater._id}`}>
                          <Button
                            variant="info"
                            className="icon-button"
                            onClick={() => handleEditModalShow(theater)}
                          >
                            <FaEdit />
                          </Button>
                        </Link>
                        <Link to={`/theater/certificateVerify/${theater._id}`}>
                          <Button variant="info" className="icon-button">
                            <FaCheck />
                          </Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))
          )}
        </Row>

        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </Container>
    </TheaterOwnerLayout>
  );
};

export default AddTheaterScreen;
