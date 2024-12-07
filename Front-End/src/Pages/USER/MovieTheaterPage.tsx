import { Key, useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { FaSearch } from "react-icons/fa";
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
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
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
  const datesToShow = 4;
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
  const filteredAndSortedTheaters = allTheaters
    .filter((theater) => {
      // Filter by city
      if (selectedCity) {
        return (
          theater.city &&
          theater.city.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }
      return true;
    })
    .filter((theater) => {
      // Filter by show time
      if (selectedTime) {
        return screens.some(
          (screen) =>
            screen.theater._id === theater._id &&
            screen.showTimes.some((show) => show.time === selectedTime)
        );
      }
      return true;
    })
    .filter((theater) => {
      // Search by theater name
      return theater.name.toLowerCase().includes(searchInput.toLowerCase());
    })
    .sort((a, b) => {
      // Optional: Add a sorting mechanism (e.g., by name or distance)
      return a.name.localeCompare(b.name);
    });
  if (loading || loadingTheaters) return <Loader />;
  if (errorTheaters) {
    toast.error("Error fetching theaters");
    return <div>Error fetching theaters</div>;
  }

  return (
    <>
      <Container style={{ padding: "40px 20px", marginBottom: "170px" }}>
        <Row className="mb-4">
          {/* Left Side: Movie Title and Genres */}
          <Col md={8}>
            <h2 className="text-dark font-weight-bold">
              {movie?.title} ({selectedLanguage})
            </h2>
            <div className="d-inline-block mb-2">
              <div className="badge border border-primary text-primary p-2 rounded-pill me-2">
                UA
              </div>
              {genres.map((genre: string, index: number) => (
                <span
                  key={index}
                  className="badge border border-primary text-dark p-2 rounded-pill me-2"
                >
                  {genre}
                </span>
              ))}
            </div>
          </Col>

          {/* Right Side: Search Bar with Icon */}
          <Col md={4} className="d-flex align-items-center justify-content-end ">
            <div className="input-group" style={{ maxWidth: "350px" }}>
              <input
                type="text"
                className="form-control rounded-pill border border-primary"
                placeholder="Search theaters..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <FaSearch style={{position: "relative", top: "18px", right: "30px"}}/>
            </div>
          </Col>
        </Row>

        <Row
          className="mb-4"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "10px",
            alignItems: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Left Side: Date Selection */}
          <Col md={6}>
            <h5 className="mb-3 text-primary">Select a Date</h5>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleBackward}
                disabled={startIndex === 0}
                className="rounded-circle border-primary text-primary"
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
                      variant={
                        selectedDate?.toISOString().split("T")[0] ===
                        date.toISOString().split("T")[0]
                          ? "primary"
                          : "outline-secondary"
                      }
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-2 rounded border-${
                        selectedDate?.toISOString().split("T")[0] ===
                        date.toISOString().split("T")[0]
                          ? "primary"
                          : "secondary"
                      }`}
                    >
                      {formatDate(date)}
                    </Button>
                  ))}
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleForward}
                disabled={startIndex + datesToShow >= dates.length}
                className="rounded-circle border-primary text-primary"
              >
                {">"}
              </Button>
            </div>
          </Col>

          {/* Right Side: Filter, Sort, and Search */}
          <Col md={6}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* Filter and Sort */}
              <div
                style={{ display: "flex", gap: "15px", alignItems: "center" }}
              >
                {/* City Filter */}
                <select
                  className="form-select rounded-pill border border-primary"
                  value={selectedCity || ""}
                  onChange={(e) => setSelectedCity(e.target.value || null)}
                >
                  <option value="">All Cities</option>
                  {[...new Set(allTheaters.map((theater) => theater.city))]
                    .filter((city) => city)
                    .map((city, idx) => (
                      <option key={idx} value={city}>
                        {city}
                      </option>
                    ))}
                </select>

                {/* Time Filter */}
                <select
                  className="form-select rounded-pill border border-primary"
                  value={selectedTime || ""}
                  onChange={(e) => setSelectedTime(e.target.value || null)}
                >
                  <option value="">All Times</option>
                  {screens
                    .flatMap((screen) => screen.showTimes)
                    .map((show) => show.time)
                    .filter((time, idx, self) => self.indexOf(time) === idx) // Remove duplicates
                    .map((time, idx) => (
                      <option key={idx} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Col>
        </Row>

        <Row
          className="mb-4"
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <Col>
            <h5 className="mb-3 text-success">Theaters</h5>
            {filteredAndSortedTheaters.length > 0 ? (
              <Row>
                {filteredAndSortedTheaters.map((theater, index) => (
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
                      <div style={{ flex: 2 }}>
                        <h5 className="font-weight-bold">
                          {theater.name}{" "}
                          <FaInfoCircle
                            className="text-primary"
                            onClick={() => handleShowModal(theater)}
                          />
                        </h5>
                        <p
                          className="text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {theater.address}
                        </p>
                      </div>
                      <div style={{ flex: 2, marginLeft: "50px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {screens
                            .filter(
                              (screen: Screen) =>
                                screen.theater._id === theater._id
                            )
                            .map(
                              (screen: Screen, idx: Key | null | undefined) => (
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "30px",
                                  }}
                                  key={idx}
                                >
                                  {screen.showTimes
                                    .filter(
                                      (show) =>
                                        show.movieTitle.trim().toLowerCase() ===
                                        movieName
                                    )
                                    .map((filteredShow, timeIdx) => (
                                      <div key={timeIdx} className="mr-2 mb-2">
                                        <Button
                                          variant="outline-primary"
                                          className="px-3 py-2 rounded border-primary"
                                          onClick={() =>
                                            navigate(
                                              `/seat-select/${screen._id}`,
                                              {
                                                state: {
                                                  date: selectedDate,
                                                  movieTitle: movie?.title,
                                                  movieId: movie?._id,
                                                  theaterId: theater?._id,
                                                  showTime: filteredShow.time,
                                                  moviePoster: moviePoster,
                                                  showTimeId: filteredShow._id,
                                                },
                                              }
                                            )
                                          }
                                        >
                                          {filteredShow.time}
                                        </Button>
                                      </div>
                                    ))}
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-danger">
                No theaters available for the selected movie.
              </p>
            )}
          </Col>
        </Row>
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
              <div className="p-4">
                <h5 className="mb-3 fw-bold">{selectedTheater.name}</h5>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedTheater.description || "No description available."}
                </p>
                <h6 className="mt-4">Available Facilities</h6>
                <ul>
                  {selectedTheater.amenities.length > 0 ? (
                    selectedTheater.amenities.map((amenity, idx) => (
                      <li key={idx}>{amenity}</li>
                    ))
                  ) : (
                    <li>No amenities listed.</li>
                  )}
                </ul>
                <p>
                  <strong>Address:</strong> {selectedTheater.address}
                </p>
                <h6 className="mt-4">Location</h6>
                <TheaterLocation
                  location={{
                    latitude: selectedTheater.latitude,
                    longitude: selectedTheater.longitude,
                    theaterName: selectedTheater.name,
                  }}
                />
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </Modal.Body>
        </Modal>
      </Container>
      <Footer />
    </>
  );
};

export default MovieTheaterScreen;
