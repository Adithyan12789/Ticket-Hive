import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useGetMovieByMovieIdQuery, useGetTheatersByMovieTitleQuery } from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TheaterManagement } from "../../Types/TheaterTypes";

const MovieTheaterScreen: React.FC = () => {
  const { movieTitle } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const formattedDate = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : null;
  const {
    data,
    isLoading: loadingTheaters,
    isError: errorTheaters,
  } = useGetTheatersByMovieTitleQuery({ movieTitle, date: formattedDate });

  const {
    data: movie,
  } = useGetMovieByMovieIdQuery(movieTitle);

  const theaters = data?.theaters || [];
  const screens = data?.screens || [];

  console.log("front end theaters: ", theaters);
  console.log("front end screens: ", screens);
  

  useEffect(() => {
    console.log(
      "Fetching theaters with movieName:",
      movieTitle,
      "and date:",
      formattedDate
    );
    document.title = movieTitle ? `Movie - Theaters` : "Movie Details";
  }, [movieTitle, formattedDate]);

  if (loadingTheaters) return <Loader />;
  if (errorTheaters) {
    toast.error("Error fetching theaters");
    return <div>Error fetching theaters</div>;
  }

  return (
    <Container style={{ padding: "40px 20px" }}>
      {/* Movie Title */}
      <Row className="mb-4">
        <Col md={8}>
          <h2 className="text-dark font-weight-bold">{movie.title}</h2>
          <p className="text-muted">
            Find the best theaters and showtimes for your movie
          </p>
        </Col>
      </Row>

      {/* Date Picker */}
      <Row className="mb-4">
        <Col md={6}>
          <h5>Select a Date</h5>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date || null)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            className="form-control shadow-sm"
          />
        </Col>
      </Row>

      {theaters.length > 0 ? (
        <div>
          <Row>
            {theaters.map((theater: TheaterManagement, index: number) => (
              <Col key={index} md={12} className="mb-4">
                {/* Inline Layout for Theater Details */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h5 className="font-weight-bold">{theater.name}</h5>
                    <p className="text-muted">{theater.address}</p>
                  </div>

                  <div style={{ flex: 2 }}>
                    <h6 className="font-weight-bold">Showtimes</h6>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {screens.length > 0 &&
                        screens.map(
                          (
                            screen: { showTimes: { time: string }[] },
                            idx: number
                          ) => (
                            <div key={idx}>
                              {screen.showTimes.map(
                                (show: { time: string }, timeIdx: number) => (
                                  <Button
                                    key={timeIdx}
                                    variant="outline-primary"
                                    className="m-1"
                                    style={{ minWidth: "100px" }}
                                  >
                                    {show.time}{" "}
                                    {/* Access the time property here */}
                                  </Button>
                                )
                              )}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <p>
              No theaters available for the selected date. Please try another
              date.
            </p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default MovieTheaterScreen;
