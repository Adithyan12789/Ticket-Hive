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
import Swal from "sweetalert2";
import {
  useAddTheaterMutation,
  useGetTheatersMutation,
  useUpdateTheaterMutation,
  useDeleteTheaterMutation,
  useUploadTheaterCertificateMutation,
} from "../../Slices/TheaterApiSlice";
import { toast } from "react-toastify";
import { FaSearch, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import TheaterOwnerLayout from "../../Components/TheaterComponents/TheaterLayout";
import Loader from "../../Components/UserComponents/Loader";
import { TheaterManagement } from "../../Types/TheaterTypes";
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
  const [showTimes, setShowTimes] = useState([
    { hour: "01", minute: "00", ampm: "AM" },
  ]);
  const [description, setDescription] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [theaters, setTheaters] = useState<TheaterManagement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addTheater] = useAddTheaterMutation();
  const [updateTheater] = useUpdateTheaterMutation();
  const [deleteTheater] = useDeleteTheaterMutation();
  const [uploadTheaterCertificate] = useUploadTheaterCertificateMutation();
  const navigate = useNavigate();
  const [getTheaters, { isLoading }] = useGetTheatersMutation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(3);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [certificateModal, setCertificateModal] = useState(false);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [ticketPrice, setTicketPrice] = useState<string>("");

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
    setLatitude(0);
    setLongitude(0);
    setSelectedImages([]);
    setShowTimes([{ hour: "01", minute: "00", ampm: "AM" }]);
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
    setTicketPrice(theater.ticketPrice);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    resetFormFields();
  };

  const handleVerifyModalShow = (theater: TheaterManagement) => {
    setSelectedTheater(theater);
    setCertificateModal(true);
  };

  const handleCertificateModalClose = () => setCertificateModal(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCounter]);

  const fetchData = async () => {
    try {
      const response = await getTheaters({}).unwrap();
      setTheaters(response);
    } catch (err) {
      console.error("Error fetching theaters", err);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificate(e.target.files[0]);
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
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteTheater({ id: theaterId }).unwrap();
        toast.success("Theater deleted successfully");
        setRefreshCounter((prev) => prev + 1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleShowTimeChange = (
    index: number,
    field: "hour" | "minute" | "ampm",
    value: string
  ) => {
    setShowTimes((prevShowTimes) =>
      prevShowTimes.map((showTime, i) =>
        i === index ? { ...showTime, [field]: value } : showTime
      )
    );
  };

  const addShowTime = () => {
    setShowTimes([...showTimes, { hour: "01", minute: "00", ampm: "AM" }]);
  };

  const validateName = (value: string) => /^[A-Za-z0-9\s'-]+$/.test(value);

  const validateCity = (value: string) => /^[A-Za-z\s'-]+$/.test(value);

  const validateCoordinates = (lat: number, lng: number) => {
    const latRegex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/;
    const lngRegex = /^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/;

    return latRegex.test(lat.toFixed(6)) && lngRegex.test(lng.toFixed(6));
  };
  

  const validateTicketPrice = (value: string) =>
    /^[0-9]+(\.[0-9]{1,2})?$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const formattedShowTimes = showTimes.map(
      ({ hour, minute, ampm }) => `${hour}:${minute} ${ampm}`
    );
  
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();
    const trimmedDescription = description.trim();
    const trimmedAmenities = amenities.map((item) => item.trim()).join(", ");
    const trimmedLatitude = latitude; // Keep as number
    const trimmedLongitude = longitude; // Keep as number
  
    if (
      !trimmedName ||
      !trimmedCity ||
      !trimmedAddress ||
      !selectedImages.length ||
      !trimmedDescription ||
      !trimmedAmenities ||
      isNaN(trimmedLatitude) ||
      isNaN(trimmedLongitude) ||
      showTimes.some(
        (time) => !time.hour.trim() || !time.minute.trim() || !time.ampm.trim()
      )
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
  
    if (formattedShowTimes.some((time) => !time)) {
      toast.error("All show times are required");
      return;
    }
  
    if (!validateTicketPrice(ticketPrice.trim())) {
      toast.error("Please enter a valid ticket price");
      return;
    }
  
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("city", trimmedCity);
      formData.append("address", trimmedAddress);
      formData.append("ticketPrice", ticketPrice.trim());
      formData.append("description", trimmedDescription);
      formData.append("amenities", trimmedAmenities);
      formData.append("latitude", trimmedLatitude.toString()); // Sending as number, converting to string for FormData
      formData.append("longitude", trimmedLongitude.toString()); // Sending as number, converting to string for FormData
  
      selectedImages.forEach((image) => formData.append("images", image));
  
      formattedShowTimes.forEach((time) => {
        formData.append("showTimes[]", time);
      });
  
      await addTheater(formData).unwrap();
      toast.success("Theater added successfully");
      handleModalClose();
      navigate("/theater/management");
      fetchData();
    }// eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      toast.error(err?.data?.message || err.error);
    }finally {
      setLoading(false);
    }
  };
  

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const lat = typeof latitude === "string" ? latitude : 0;
    const long = typeof longitude === "string" ? longitude : 0;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("city", city.trim());
    formData.append("address", address.trim());
    formData.append("description", description.trim());
    formData.append("amenities", amenities.join(", "));
    formData.append("latitude", lat.toString());
    formData.append("longitude", long.toString());
    formData.append("ticketPrice", ticketPrice.trim());

    showTimes.forEach((time) => {
      formData.append(
        "showTimes[]",
        `${time.hour}:${time.minute} ${time.ampm}`
      );
    });

    if (selectedImages.length) {
      selectedImages.forEach((image) => formData.append("images", image));
    }

    if (!validateTicketPrice(ticketPrice.trim())) {
      toast.error("Please enter a valid ticket price");
      return;
    }

    try {
      const data = {
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        description: description.trim(),
        ticketPrice: ticketPrice.trim(),
        amenities: amenities,
        latitude: lat,
        longitude: long,
        showTimes: showTimes.map(
          (time) => `${time.hour}:${time.minute} ${time.ampm}`
        ),
      };

      await updateTheater({ id: selectedTheater?._id, data }).unwrap();
      toast.success("Theater updated successfully");
      handleEditModalClose();
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleCertificateUpload = async () => {
    if (!certificate || !selectedTheater?._id) {
      toast.error("Please select a certificate file and a theater");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificate", certificate);

      await uploadTheaterCertificate({
        theaterId: selectedTheater._id,
        formData,
      }).unwrap();

      toast.success("Certificate uploaded successfully");
      handleCertificateModalClose();
      setRefreshCounter((prev) => prev + 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Failed to upload certificate", err);
    }
  };

  const indexOfLastTheater = currentPage * itemsPerPage;
  const indexOfFirstTheater = indexOfLastTheater - itemsPerPage;
  const currentTheaters = theaters.slice(
    indexOfFirstTheater,
    indexOfLastTheater
  );
  const totalPages = Math.ceil(theaters.length / itemsPerPage);

  if (isLoading || loading) return <Loader />;

  const removeShowTime = (index: number) => {
    setShowTimes(showTimes.filter((_, i) => i !== index));
  };

  return (
    <TheaterOwnerLayout theaterOwnerName="John Doe">
      <Container
        className="px-5 w-78"
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <Row className="justify-content-between align-items-center mb-3">
          <Col md={6} className="d-flex pt-4">
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
                  <Form.Group controlId="ticketPrice" className="mb-3">
                    <Form.Label>Ticket Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter ticket price"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
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
                  <Form.Group className="mb-3">
                    <Form.Label>Show Times</Form.Label>
                    <div className="d-flex flex-wrap">
                      {showTimes.map((showTime, index) => (
                        <div
                          className="d-flex align-items-center me-2 mb-2"
                          key={index}
                        >
                          <Form.Select
                            value={showTime.hour}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) =>
                              handleShowTimeChange(
                                index,
                                "hour",
                                e.target.value
                              )
                            }
                            className="me-2"
                            style={{ width: "150px" }}
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i + 1).padStart(2, "0")}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Select
                            value={showTime.minute}
                            onChange={(e) =>
                              handleShowTimeChange(
                                index,
                                "minute",
                                e.target.value
                              )
                            }
                            className="me-2"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i).padStart(2, "0")}
                              >
                                {String(i).padStart(2, "0")}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Select
                            value={showTime.ampm}
                            onChange={(e) =>
                              handleShowTimeChange(
                                index,
                                "ampm",
                                e.target.value
                              )
                            }
                            className="me-2"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </Form.Select>
                          <Button
                            variant="danger"
                            onClick={() => removeShowTime(index)}
                            style={{ height: "40px", marginTop: "5px" }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="secondary" onClick={addShowTime}>
                      Add Another Show Time
                    </Button>
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
                      onChange={(e) =>
                        setLatitude(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Form.Group>
                  <Form.Group controlId="longitude" className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) =>
                        setLongitude(parseFloat(e.target.value) || 0)
                      }
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
                  <Form.Group controlId="ticketPrice" className="mb-3">
                    <Form.Label>Ticket Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter ticket price"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
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
                  <Form.Group className="mb-3">
                    <Form.Label>Show Times</Form.Label>
                    <div className="d-flex flex-wrap">
                      {showTimes.map((showTime, index) => (
                        <div
                          className="d-flex align-items-center me-2 mb-2"
                          key={index}
                        >
                          {/* Hour Selection */}
                          <Form.Select
                            value={showTime.hour}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) =>
                              handleShowTimeChange(
                                index,
                                "hour",
                                e.target.value
                              )
                            }
                            className="me-2"
                            style={{ width: "150px" }}
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i + 1).padStart(2, "0")}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Minute Selection */}
                          <Form.Select
                            value={showTime.minute}
                            onChange={(e) =>
                              handleShowTimeChange(
                                index,
                                "minute",
                                e.target.value
                              )
                            }
                            className="me-2"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i).padStart(2, "0")}
                              >
                                {String(i).padStart(2, "0")}
                              </option>
                            ))}
                          </Form.Select>

                          {/* AM/PM Selection */}
                          <Form.Select
                            value={showTime.ampm}
                            onChange={(e) =>
                              handleShowTimeChange(
                                index,
                                "ampm",
                                e.target.value
                              )
                            }
                            className="me-2"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </Form.Select>

                          {/* Remove Show Time Button */}
                          <Button
                            variant="danger"
                            onClick={() => removeShowTime(index)}
                            style={{ height: "40px", marginTop: "5px" }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add Another Show Time Button */}
                    <Button variant="secondary" onClick={addShowTime}>
                      Add Another Show Time
                    </Button>
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
                      onChange={(e) =>
                        setLatitude(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Form.Group>
                  <Form.Group controlId="longitude" className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) =>
                        setLongitude(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                {loading ? "Saving..." : "Save Theater"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal show={certificateModal} onHide={handleCertificateModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Verify Theater Certificate</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Upload Certificate</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleCertificateChange}
                />
                {certificate && (
                  <div className="mt-3">
                    <img
                      src={URL.createObjectURL(certificate)}
                      alt="Certificate Preview"
                      className="img-thumbnail"
                      style={{ width: "150px" }}
                    />
                  </div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCertificateModalClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCertificateUpload}>
              Upload
            </Button>
          </Modal.Footer>
        </Modal>

        <Row>
          {currentTheaters.length === 0 ? (
            <Col className="text-center">No theaters found.</Col>
          ) : (
            currentTheaters.map((theater) => (
              <Col key={theater._id} md={4} className="mb-4">
                <Card style={{ height: "450px" }}>
                  <Link
                    to={`/theater/details/${theater?._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Card.Img
                      variant="top"
                      src={
                        theater.images.length > 0
                          ? `${THEATER_IMAGES_DIR_PATH}${theater.images[0]}`
                          : DEFAULT_THEATER_IMAGE
                      }
                      alt={theater.name}
                    />
                  </Link>
                  <Card.Body>
                    <Card.Title>{theater.name}</Card.Title>
                    <Card.Text>
                      {theater.description.split(" ").slice(0, 20).join(" ")}...
                    </Card.Text>

                    <div className="button-group">
                      {!theater.isVerified && (
                        <Button
                          variant="info"
                          className="icon-button"
                          onClick={() => handleVerifyModalShow(theater)}
                        >
                          <FaCheck />
                        </Button>
                      )}
                      <Button
                        variant="info"
                        className="icon-button"
                        onClick={() => handleEditModalShow(theater)}
                      >
                        <FaEdit />
                      </Button>

                      <Button
                        variant="danger"
                        className="icon-button"
                        onClick={() => handleDelete(theater._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
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
