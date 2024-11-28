import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Spinner,
  Row,
  Col,
  Container,
  Form,
  Pagination,
} from "react-bootstrap";

import { useSaveUserLocationMutation } from "../../Slices/UserApiSlice";

import Loader from "./Loader";
import { CitiesModalProps } from "../../Types/CitiesTypes";

const CitiesModal: React.FC<CitiesModalProps> = ({
  show,
  handleClose,
  handleCitySelect,
}) => {
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    latitude: number | null;
    longitude: number | null;
  }>({
    city: "Select your city",
    latitude: null,
    longitude: null,
  });

  const [saveUserLocation] = useSaveUserLocationMutation();

  const itemsPerPage = 12;

  const fetchUserLocation = async () => {
    setLoading(true);
  
    if (!navigator.geolocation) {
      setUserLocation((prev) => ({
        ...prev,
        city: "Geolocation not supported",
      }));
      setLoading(false);
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
  
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const cityName = data.city || "Unknown Location";
  
          setUserLocation({
            city: cityName,
            latitude,
            longitude,
          });
  
          await saveUserLocation({ city: cityName, latitude, longitude }).unwrap();
        } catch (err) {
          console.log("err: ", err);
          setUserLocation((prev) => ({
            ...prev,
            city: "Failed to fetch location",
          }));
        } finally {
          setLoading(false);
        }
      },
      () => {
        setUserLocation((prev) => ({
          ...prev,
          city: "Location permission denied",
        }));
        setLoading(false);
      }
    );
  };  

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://countriesnow.space/api/v0.1/countries/cities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ country: "India" }),
          }
        );
        const data = await response.json();

        if (data.error) throw new Error(data.msg || "Failed to fetch cities");
        setCities(data.data);
        setFilteredCities(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (show) fetchCities();
  }, [show]);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredCities(filtered);
    setCurrentPage(1);
  }, [searchQuery, cities]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCities = filteredCities.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const fetchCityCoordinates = async (city: string) => {
    try {
      const apiKey = "af909a0b110a434ebad61f0aa32717e5";
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from geocode service");
      }

      const data = await response.json();
      const { lat, lng } = data.results[0]?.geometry || {};

      if (!lat || !lng) {
        throw new Error("Invalid coordinates received");
      }

      return { latitude: lat, longitude: lng };
    } catch (err) {
      console.error("Error fetching city coordinates:", err);
      return null;
    }
  };

  const handleCitySelectInternal = async (city: string) => {
    setLoading(true);

    try {
      const cityCoordinates = await fetchCityCoordinates(city);

      if (cityCoordinates) {
        const { latitude, longitude } = cityCoordinates;

        await saveUserLocation({ city, latitude, longitude }).unwrap();
        handleCitySelect(city); // Call the parent handler to update the city
        handleClose();
      } else {
        alert("Failed to fetch coordinates for the selected city. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching coordinates for city:", err);
      alert("An error occurred while fetching coordinates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Select a City <br />
          <small className="text-muted">
            Your Location: {userLocation.city}
          </small>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search for a city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={fetchUserLocation}
          className="mb-3 w-100"
        >
          Detect My Location
        </Button>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading cities...</p>
          </div>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (
          <Container>
            <Row>
              {currentCities.map((city, index) => (
                <Col
                  key={index}
                  xs={6}
                  md={4}
                  lg={3}
                  className="mb-3 text-center"
                >
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => handleCitySelectInternal(city)}
                  >
                    {city}
                  </Button>
                </Col>
              ))}
            </Row>
            {filteredCities.length === 0 && (
              <p className="text-center text-muted">No cities found.</p>
            )}
          </Container>
        )}
      </Modal.Body>
      <Modal.Footer>
        {filteredCities.length > itemsPerPage && (
          <Pagination className="m-auto">
            <Pagination.Prev disabled={currentPage === 1} onClick={handlePrev}>
              &laquo; Previous
            </Pagination.Prev>
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={handleNext}
            >
              Next &raquo;
            </Pagination.Next>
          </Pagination>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


export default CitiesModal;
