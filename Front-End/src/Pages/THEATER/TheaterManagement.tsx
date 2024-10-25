import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Button, Form, Container, Table, Modal, Row, Col } from "react-bootstrap";
import {
  useAddTheaterMutation,
  useGetTheatersMutation,
} from "../../Slices/TheaterApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TheaterOwnerLayout from "../../Components/TheaterComponents/TheaterLayout";
import Loader from "../../Components/UserComponents/Loader";
import { TheaterManagement } from "../../Types";
import './TheaterManagement.css';

const AddTheaterScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");
  const [amenities, setAmenities] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [longitude, setLongitude] = useState<string>("");
  const [theaters, setTheaters] = useState<TheaterManagement[]>([]);

  const [addTheater] = useAddTheaterMutation();
  const navigate = useNavigate();
  const [getTheaters, { isLoading }] = useGetTheatersMutation();

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTheaters({}).unwrap();
        console.log("Fetched theaters: ", response);
        setTheaters(response);
      } catch (err) {
        console.error("Error fetching theaters", err);
      }
    };
    fetchData();
  }, [getTheaters]);

  useEffect(() => {
    document.title = "Add Theater";
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedImages(validImages);
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
    const trimmedAmenities = amenities.trim();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) return <Loader />;

  return (
    <TheaterOwnerLayout theaterOwnerName="John Doe">
      <Container className="px-4 w-75" style={{ maxHeight: "100vh", overflowY: "auto" }}>
        <h1 className="my-3">Theater Management</h1>
        <Button variant="primary" className="my-3" onClick={handleModalShow}>
          Add Theater
        </Button>

        {/* Add Theater Modal */}
        <Modal show={showModal} onHide={handleModalClose} centered className="custom-modal">
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
                    <Form.Control type="file" multiple onChange={handleImageChange} />
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
                      value={amenities}
                      onChange={(e) => setAmenities(e.target.value)}
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

        {/* Theater Table */}
        {theaters.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {theaters.map((theater) => (
                <tr key={theater.id}>
                  <td>{theater.name}</td>
                  <td>{theater.city}</td>
                  <td>{theater.address}</td>
                  <td>
                    <Button variant="warning" className="btn-sm mx-2">
                      Edit
                    </Button>
                    <Button variant="danger" className="btn-sm">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No theaters added yet.</p>
        )}
      </Container>
    </TheaterOwnerLayout>
  );
};

export default AddTheaterScreen;
