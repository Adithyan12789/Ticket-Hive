  import { Key, useEffect, useState } from "react";
  import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
  import { FaSearch, FaInfoCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
  import {
    useGetMovieByMovieIdQuery,
    useGetTheatersByMovieTitleQuery,
  } from "../../Slices/UserApiSlice";
  import 'react-datepicker/dist/react-datepicker.css'
  import Loader from "../../Components/UserComponents/Loader";
  import 'react-datepicker/dist/react-datepicker.css'
  import { toast } from "react-toastify";
  import "react-datepicker/dist/react-datepicker.css";
  import { RootState } from "../../Store";
  import { useSelector } from "react-redux";
  import TheaterLocation from "../../Components/UserComponents/TheaterLocation";
  import { UserInfo } from "../../Types/UserTypes";
  import { Screen } from "../../Types/ScreenTypes";
  import { TheaterManagement } from "../../Types/TheaterTypes";
  import Footer from "../../Components/UserComponents/Footer";
  import './MovieTheaterPage.css';
  import React from "react";

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

    console.log("theaters: ", theaters);
    console.log("movie: ", movie);
    console.log("screens: ", screens);
    console.log("user: ", user);
    

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
              screen.schedule.some((schedule) =>
                schedule.showTimes.some((show) => show.time === selectedTime)
              )
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

    console.log("filteredAndSortedTheaters: ", filteredAndSortedTheaters);
    console.log("screens: ", screens);
    

    return (
      <div className="movieTheater-movie-theater-screen">
        <div className="movieTheater-container">
          <div className="movieTheater-movie-info">
            <h1 className="movieTheater-movie-title">{movie?.title} ({selectedLanguage})</h1>
            <div className="movieTheater-genre-tags">
              <span className="movieTheater-genre-tag ua">UA</span>
              {genres.map((genre: string, index: number) => (
                <span key={index} className="movieTheater-genre-tag">{genre}</span>
              ))}
            </div>
            <div className="movieTheater-search-container">
              <input
                type="text"
                className="movieTheater-search-input"
                placeholder="Search theaters..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <FaSearch className="movieTheater-search-icon" />
            </div>
          </div>
  
          <div className="movieTheater-date-selector">
            <h2>Select a Date</h2>
            <div className="movieTheater-date-buttons">
              <button
                onClick={handleBackward}
                disabled={startIndex === 0}
                className="movieTheater-nav-button"
              >
                <FaChevronLeft />
              </button>
              {dates.slice(startIndex, startIndex + datesToShow).map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`movieTheater-date-button ${selectedDate?.toISOString().split("T")[0] === date.toISOString().split("T")[0] ? 'active' : ''}`}
                >
                  {formatDate(date)}
                </button>
              ))}
              <button
                onClick={handleForward}
                disabled={startIndex + datesToShow >= dates.length}
                className="movieTheater-nav-button"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
  
          <div className="movieTheater-filters">
            <select
              className="movieTheater-filter-select"
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(e.target.value || null)}
            >
              <option value="">All Cities</option>
              {[...new Set(allTheaters.map((theater) => theater.city))]
                .filter((city) => city)
                .map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
            </select>
            <select
              className="movieTheater-filter-select"
              value={selectedTime || ""}
              onChange={(e) => setSelectedTime(e.target.value || null)}
            >
              <option value="">All Times</option>
              {screens
                .flatMap((screen) => screen.schedule.flatMap((schedule) => schedule.showTimes))
                .map((show) => show.time)
                .filter((time, idx, self) => self.indexOf(time) === idx)
                .map((time, idx) => (
                  <option key={idx} value={time}>{time}</option>
                ))}
            </select>
          </div>
  
          <div className="movieTheater-theaters-container">
            <h2>Theaters</h2>
            {filteredAndSortedTheaters.length > 0 ? (
              filteredAndSortedTheaters.map((theater, index) => (
                <div key={index} className="movieTheater-theater-card">
                  <div className="movieTheater-theater-info">
                    <h3>
                      {theater.name}
                      <FaInfoCircle
                        onClick={() => handleShowModal(theater)}
                        className="movieTheater-info-icon"
                      />
                    </h3>
                    <p className="movieTheater-theater-address">{theater.address}</p>
                  </div>
                  <div className="movieTheater-show-times">
                    {screens
                      .filter((screen: Screen) => screen.theater._id === theater._id)
                      .map((screen: Screen, idx: Key | null | undefined) => (
                        <React.Fragment key={idx}>
                          {screen.schedule
                            .flatMap((schedule) => schedule.showTimes)
                            .filter((show) => show.movieTitle.trim().toLowerCase() === movieName)
                            .map((filteredShow, timeIdx) => (
                              <button
                                key={timeIdx}
                                className="movieTheater-show-time-button"
                                onClick={() =>
                                  navigate(`/seat-select/${screen._id}`, {
                                    state: {
                                      date: selectedDate,
                                      movieTitle: movie?.title,
                                      movieId: movie?._id,
                                      theaterId: theater?._id,
                                      showTime: filteredShow.time,
                                      moviePoster: moviePoster,
                                      showTimeId: filteredShow._id,
                                    },
                                  })
                                }
                              >
                                {filteredShow.time}
                              </button>
                            ))}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-theaters">No theaters available for the selected movie.</p>
            )}
          </div>
        </div>
  
        {modalVisible && (
          <div className="movieTheater-modal-overlay">
            <div className="movieTheater-modal-content">
              <div className="movieTheater-modal-body">
                <h2>{selectedTheater?.name}</h2>
                <p><strong>Description:</strong> {selectedTheater?.description || "No description available."}</p>
                <h3>Available Facilities</h3>
                <ul>
                  {selectedTheater?.amenities.length ? (
                    selectedTheater.amenities.map((amenity, idx) => (
                      <li key={idx}>{amenity}</li>
                    ))
                  ) : (
                    <li>No amenities listed.</li>
                  )}
                </ul>
                <p><strong>Address:</strong> {selectedTheater?.address}</p>
                <h3>Location</h3>
                {selectedTheater && (
                  <div className="movieTheater-theater-location">
                    <TheaterLocation
                      location={{
                        latitude: selectedTheater.latitude,
                        longitude: selectedTheater.longitude,
                        theaterName: selectedTheater.name,
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="movieTheater-modal-footer">
                <button
                  className="movieTheater-close-button"
                  onClick={() => setModalVisible(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
  
        <Footer />
      </div>
    );
  };
  
  export default MovieTheaterScreen;