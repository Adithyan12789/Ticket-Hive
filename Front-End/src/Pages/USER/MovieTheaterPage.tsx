import { Key, useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  useGetMovieByMovieIdQuery,
  useGetTheatersByMovieTitleQuery,
} from "../../Slices/UserApiSlice";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import TheaterLocation from "../../Components/UserComponents/TheaterLocation";
import { UserInfo } from "../../Types/UserTypes";
import { Screen } from "../../Types/ScreenTypes";
import { TheaterManagement } from "../../Types/TheaterTypes";
import Footer from "../../Components/UserComponents/Footer";

type TheaterData = {
  theaters: TheaterManagement[];
  screens: Screen[];
  user: UserInfo;
};

const MovieTheaterScreen: React.FC = () => {
  const { movieTitle } = useParams<{ movieTitle: string }>();
  const [searchParams] = useSearchParams();
  const [startIndex, setStartIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTheater, setSelectedTheater] =
    useState<TheaterManagement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  const { moviePoster } = location.state || {};

  const dates = [...Array(365)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    dates[0] || null
  );

  const formattedDate = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : null;

  const userId = userInfo?.id;

  const {
    data,
    isLoading: loadingTheaters,
    isError: errorTheaters,
  } = useGetTheatersByMovieTitleQuery({
    movieTitle,
    date: formattedDate,
    userId,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const { data: movie } = useGetMovieByMovieIdQuery(movieTitle || "");

  const theaters = (data as TheaterData)?.theaters || [];
  const screens = (data as TheaterData)?.screens || [];
  const user = (data as TheaterData)?.user || [];

  const selectedLanguage = searchParams.get("language") || "English";

  const userLocation = {
    latitude: user?.latitude,
    longitude: user?.longitude,
    city: user?.city,
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number): number => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };


  useEffect(() => {
    document.title = movieTitle ? `Movie - Theaters` : "Movie Details";
  }, [movieTitle, formattedDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const movieName = movie?.title?.trim().toLowerCase();
  const genres = movie?.genres || [];

  const datesToShow = 7;

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleForward = () => {
    if (startIndex + datesToShow < dates.length) {
      setStartIndex(startIndex + datesToShow);
    }
  };

  const handleBackward = () => {
    if (startIndex - datesToShow >= 0) {
      setStartIndex(startIndex - datesToShow);
    }
  };

  const handleShowModal = (theater: TheaterManagement) => {
    setSelectedTheater(theater);
    setModalVisible(true);
  };

  const sortedTheaters = theaters.map((theater) => {
    const distance =
      userLocation.latitude &&
      userLocation.longitude &&
      theater.latitude &&
      theater.longitude
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            theater.latitude,
            theater.longitude
          )
        : null;

    return { ...theater, distance };
  });

  const theatersInSameCity = theaters.filter(
    (theater) =>
      theater.city &&
      user.city &&
      theater.city.toLowerCase() === user.city.toLowerCase()
  );

  const theatersOutsideCity = sortedTheaters.filter(
    (theater) =>
      !(
        theater.city &&
        userLocation.city &&
        theater.city.toLowerCase() === userLocation.city.toLowerCase()
      )
  );

  const nearbyTheatersOutsideCity = theatersOutsideCity
    .filter((theater) => theater.distance !== null && theater.distance <= 10)
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  const otherTheatersOutsideCity = theatersOutsideCity
    .filter((theater) => theater.distance === null || theater.distance > 10)
    .sort((a, b) => a.name.localeCompare(b.name));

  const allTheaters = [
    ...theatersInSameCity,
    ...nearbyTheatersOutsideCity,
    ...otherTheatersOutsideCity,
  ];

  if (loading || loadingTheaters) return <Loader />;

  if (errorTheaters) {
    toast.error("Error fetching theaters");
    return <div>Error fetching theaters</div>;
  }

  return (
    <><Container style={{ padding: "40px 20px" }}>
      <Row className="mb-4">
        <Col md={8}>
          <h2 className="text-dark font-weight-bold">
            {movie?.title} ({selectedLanguage})
          </h2>
          <div style={{ display: "inline-block", marginBottom: "10px" }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 10px",
                backgroundColor: "#e0e0e0",
                borderRadius: "20px",
                fontSize: "0.9rem",
                marginRight: "10px",
              }}
            >
              UA
            </div>
            {genres.map((genre: string, index: number) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  marginRight: "8px",
                  padding: "5px 10px",
                  backgroundColor: "#f1f1f1",
                  borderRadius: "15px",
                  fontSize: "0.85rem",
                  color: "#555",
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5 className="mb-3">Select a Date</h5>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleBackward}
              disabled={startIndex === 0}
              style={{
                minWidth: "40px",
                borderRadius: "50%",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {"<"}
            </Button>


            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "10px",
                padding: "5px 0",
              }}
            >
              {dates
                .slice(startIndex, startIndex + datesToShow)
                .map((date, index) => (
                  <Button
                    key={index}
                    variant={selectedDate?.toISOString().split("T")[0] ===
                      date.toISOString().split("T")[0]
                      ? "primary"
                      : "outline-secondary"}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      padding: "10px 15px",
                      borderRadius: "10px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(date)}
                  </Button>
                ))}
            </div>


            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleForward}
              disabled={startIndex + datesToShow >= dates.length}
              style={{
                minWidth: "40px",
                borderRadius: "50%",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {">"}
            </Button>
          </div>
        </Col>
      </Row>

      {allTheaters.length > 0 ? (
        <div>
          <Row>
            {allTheaters.map((theater, index) => (
              <Col key={index} md={12} className="mb-4">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "15px",
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h5 className="font-weight-bold">
                      {theater.name}{" "}
                      <FaInfoCircle
                        style={{ color: "#007bff", cursor: "pointer" }}
                        onClick={() => handleShowModal(theater)} />
                    </h5>
                    <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                      {theater.address}
                    </p>
                  </div>

                  <div style={{ flex: 2, marginLeft: "50px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {screens
                        .filter(
                          (screen: Screen) => screen.theater._id === theater._id
                        )
                        .map((screen: Screen, idx: Key | null | undefined) => (
                          <div
                            style={{ display: "flex", flexWrap: "wrap" }}
                            key={idx}
                          >
                            {screen.showTimes
                              .filter(
                                (show) => show.movieTitle.trim().toLowerCase() ===
                                  movieName
                              )
                              .map((filteredShow, timeIdx) => (
                                <div key={timeIdx} className="mr-2 mb-2">
                                  <Button
                                    variant="outline-primary"
                                    style={{
                                      minWidth: "100px",
                                      fontSize: "0.85rem",
                                      marginRight: "40px",
                                      transition: "all 0.3s ease-in-out",
                                    }}
                                    onClick={() => navigate(`/seat-select/${screen._id}`, {
                                      state: {
                                        date: selectedDate,
                                        movieTitle: movie?.title,
                                        movieId: movie?._id,
                                        theaterId: theater?._id,
                                        showTime: filteredShow.time,
                                        moviePoster: moviePoster,
                                        showTimeId: filteredShow._id,
                                      },
                                    })}
                                  >
                                    {filteredShow.time}
                                  </Button>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <p>No theaters available for the selected movie.</p>
      )}

      <Modal
        show={modalVisible}
        onHide={() => setModalVisible(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Theater Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTheater ? (
            <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
              <div style={{ marginBottom: "20px" }}>
                <h5
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  {selectedTheater.name}
                </h5>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#555",
                  marginBottom: "20px",
                }}
              >
                <strong>Description:</strong>{" "}
                {selectedTheater.description || "No description available."}
              </p>
              <h1
                style={{
                  color: "#333",
                  fontSize: "1.25rem",
                  marginBottom: "15px",
                }}
              >
                Available Facilities
              </h1>
              <ul
                style={{
                  listStyleType: "disc",
                  marginLeft: "20px",
                  fontSize: "1rem",
                }}
              >
                {selectedTheater.amenities.length > 0 ? (
                  selectedTheater.amenities.map((amenity, idx) => (
                    <li
                      key={idx}
                      style={{ marginBottom: "8px", color: "#555" }}
                    >
                      {amenity}
                    </li>
                  ))
                ) : (
                  <li>No amenities listed.</li>
                )}
              </ul>
              <strong className="mt-5">Address</strong>{" "}
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#555",
                }}
              >
                {selectedTheater.address}
              </p>

              <div style={{ marginTop: "20px" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    marginBottom: "10px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Location
                </h2>
                <TheaterLocation
                  location={{
                    latitude: selectedTheater.latitude,
                    longitude: selectedTheater.longitude,
                    theaterName: selectedTheater.name,
                  }} />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "1rem", color: "#888" }}>Loading...</p>
          )}
        </Modal.Body>
      </Modal>
    </Container><Footer /></>
  );
};

export default MovieTheaterScreen;
