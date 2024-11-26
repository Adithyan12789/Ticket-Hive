import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Container,
  Row,
  Col,
  Form,
  Card,
  Badge,
  Carousel,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetMovieByMovieIdQuery,
  useGetReviewsQuery,
  useAddReviewMutation,
} from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegStar,
  FaStar,
  FaThumbsDown,
  FaThumbsUp,
  FaUserAlt,
} from "react-icons/fa";

const USER_MOVIE_POSTER = "http://localhost:5000/MoviePosters/";
const USER_MOVIE_IMAGES = "http://localhost:5000/movieImages/";
const USER_MOVIE_CAST_IMAGES = "http://localhost:5000/CastsImages/";

interface Review {
  _id: string;
  user: {
    name: string;
  };
  comment: string;
  rating: number;
  date: string;
  likes: number;
  dislikes: number;
}

const MovieDetailScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewsState, setReviewsState] = useState<Review[]>([]);

  const { userInfo } = useSelector((state: RootState) => state.auth);

  const {
    data: movie,
    isLoading: loadingMovie,
    isError: errorMovie,
    refetch,
  } = useGetMovieByMovieIdQuery(id);
  const {
    data: reviews,
    isLoading: loadingReviews,
    refetch: refetchReviews,
  } = useGetReviewsQuery(id);
  const [addReview, { isLoading: addingReview }] = useAddReviewMutation();

  // After fetching reviews, initialize the state
  useEffect(() => {
    if (reviews) {
      setReviewsState(reviews);
    }
  }, [reviews]);

  useEffect(() => {
    document.title = movie ? `${movie.title} - Movie Details` : "Movie Details";
    refetch();
  }, [id, refetch, movie]);

  useEffect(() => {
    // Simulate a 4-second loading delay
    const timer = setTimeout(() => {
      setLoading(false); // After 4 seconds, set loading to false
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const handleBookNow = () => {
    if (!movie || !movie.languages.length) {
      toast.error("No languages available for this movie.");
      return;
    }
    setShowModal(true);
  };

  console.log("movie posters: ", movie?.posters);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowModal(false);
    navigate(`/movie-theaters/${id}?language=${language}`, {
      state: {
        moviePoster: movie?.posters,
      },
    });
  };

  const userId = userInfo?.id;

  const handleAddReview = async () => {
    if (!reviewText || rating === 0) {
      toast.error("Please provide both a review and a rating.");
      return;
    }

    try {
      await addReview({
        movieId: id,
        review: reviewText,
        rating,
        userId,
      }).unwrap();

      toast.success("Review added successfully!");
      setReviewText("");
      setRating(0);
      refetchReviews();
      setShowReviewModal(false);
    } catch (error) {
      toast.error("Error adding review. Please try again.");
      console.error("Review error:", error);
    }
  };

  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;

    const totalRating = reviews.reduce(
      (acc: number, review: Review) => acc + review.rating,
      0
    );
    return totalRating / reviews.length;
  };

  const averageRating = getAverageRating();

  // Render only 1 star, but show rating in the "x/10" format
  const renderStars = (rating: number) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <FaStar style={{ color: "#f39c12", marginRight: "5px" }} />
        <span>{rating}/10</span>
      </div>
    );
  };

  const [userActions, setUserActions] = useState<{
    [reviewId: string]: string;
  }>({});

  // Handler for liking a review
  const handleLike = (reviewId: string) => {
    setReviewsState((prevReviews) =>
      prevReviews.map((review) =>
        review._id === reviewId && userActions[reviewId] !== "like"
          ? {
              ...review,
              likes:
                userActions[reviewId] === "dislike"
                  ? review.likes + 1
                  : review.likes + 1,
              dislikes:
                userActions[reviewId] === "dislike"
                  ? review.dislikes - 1
                  : review.dislikes,
            }
          : review
      )
    );
    setUserActions((prev) => ({ ...prev, [reviewId]: "like" }));
  };

  // Handler for disliking a review
  const handleDislike = (reviewId: string) => {
    setReviewsState((prevReviews) =>
      prevReviews.map((review) =>
        review._id === reviewId && userActions[reviewId] !== "dislike"
          ? {
              ...review,
              dislikes:
                userActions[reviewId] === "like"
                  ? review.dislikes + 1
                  : review.dislikes + 1,
              likes:
                userActions[reviewId] === "like"
                  ? review.likes - 1
                  : review.likes,
            }
          : review
      )
    );
    setUserActions((prev) => ({ ...prev, [reviewId]: "dislike" }));
  };

  if (loading || loadingMovie) return <Loader />;

  if (errorMovie) {
    toast.error("Error fetching movie details");
    console.error("Fetch error:", errorMovie);
    return <div>Error fetching data</div>;
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "500px",
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url(${USER_MOVIE_IMAGES}${movie.images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          marginBottom: "20px",
        }}
      >
        <Container
          style={{
            position: "absolute",
            top: "40px",
            left: "200px",
            zIndex: 2,
            color: "#fff",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <Row>
            <Col md={5}>
              <img
                src={`${USER_MOVIE_POSTER}${movie.posters}`}
                alt={movie.title}
                style={{
                  width: "80%",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </Col>
            <Col md={7}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                {movie.title}
              </h2>
              <p>{movie.genres.join(", ")}</p>
              <p>
                {movie.languages.join(", ")} | {movie.duration} |{" "}
                {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {/* Display Average Rating and Add Review Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between", // Ensures proper spacing
                  backgroundColor: "rgba(255, 255, 255, 0.2)", // Light semi-transparent background
                  padding: "10px 15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                {averageRating > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "1rem",
                          color: "#fff",
                        }}
                      >
                        Average Rating:{" "}
                      </span>
                      <span
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color: "#f39c12", // Yellow color for stars or ratings
                          marginLeft: "10px",
                        }}
                      >
                        {renderStars(Math.round(averageRating))}
                      </span>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: "1rem", color: "#fff" }}>
                    No reviews yet
                  </span>
                )}

                <Button
                  variant="secondary"
                  style={{
                    backgroundColor: "#fff",
                    color: "#007bff", // Button text color
                    border: "1px solid #007bff",
                    borderRadius: "5px",
                    padding: "5px 15px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setShowReviewModal(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#007bff";
                    e.currentTarget.style.color = "#ddd";
                  }}
                >
                  Rate now
                </Button>
              </div>

              <button
                style={{
                  backgroundColor: "#ff4081",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  marginTop: "20px",
                  fontSize: "18px",
                }}
                onClick={handleBookNow}
              >
                Book Tickets
              </button>
            </Col>
          </Row>
        </Container>
      </div>
      <Container style={{ padding: "30px 20px" }}>
        <Row className="justify-content-center">
          <Col md={10}>
            <div
              style={{
                padding: "20px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <h3>About the movie</h3>
              <p style={{ color: "#555" }}>{movie.description}</p>
            </div>
          </Col>
        </Row>
      </Container>
      <Container style={{ padding: "30px 20px" }}>
        <Row className="justify-content-center text-center mb-4">
          <Col md={12}>
            <h3>Casts</h3>
          </Col>
        </Row>
        <Row className="justify-content-center">
          {movie.casts.map((actor: string, index: number) => (
            <Col key={index} md={3} className="text-center">
              <img
                src={`${USER_MOVIE_CAST_IMAGES}${movie.castsImages[index]}`}
                alt={actor}
                style={{
                  borderRadius: "50%",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
                  marginBottom: "10px",
                }}
              />
              <p>{actor}</p>
            </Col>
          ))}
        </Row>
      </Container>
      <Container className="mt-5" style={{ padding: "30px 20px" }}>
        <h1 style={{ color: "#5c5c5c" }}>Top Reviews</h1>

        {loadingReviews ? (
          <Loader />
        ) : (
          <>
            {/* Reviews Carousel */}
            <Carousel
              indicators={false}
              controls={true}
              interval={null}
              prevIcon={
                <FaChevronLeft size={30} style={{ color: "#007bff" }} />
              }
              nextIcon={
                <FaChevronRight size={30} style={{ color: "#007bff" }} />
              }
            >
              {reviewsState.map((review: Review) => (
                <Carousel.Item key={review._id}>
                  <Row className="justify-content-center">
                    <Col md={8} sm={12}>
                      <Card
                        style={{
                          borderRadius: "10px",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                          padding: "20px",
                        }}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                              <FaUserAlt size={30} color="#007bff" />
                              <strong style={{ paddingLeft: "20px" }}>
                                {review.user.name}
                              </strong>
                              <Badge
                                pill
                                bg="info"
                                style={{
                                  marginLeft: "10px",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {"User"}
                              </Badge>
                            </div>
                            <div
                              style={{
                                color: `hsl(${
                                  (review.rating / 10) * 120
                                }, 70%, 50%)`,
                              }}
                            >
                              {Array.from(
                                { length: review.rating },
                                () => "⭐"
                              ).join("")}
                            </div>
                          </div>
                          <p
                            className="mt-5"
                            style={{ fontSize: "1rem", color: "#6c757d" }}
                          >
                            {review.comment}
                          </p>
                          <div className="d-flex mt-5">
                            {/* Like Button */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginRight: "40px",
                              }}
                            >
                              <Button
                                variant="light"
                                style={{
                                  borderRadius: "50%",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                  border: "2px solid rgb(0, 123, 255)",
                                  backgroundColor:
                                    userActions[review._id] === "like"
                                      ? "rgb(0, 123, 255)"
                                      : "transparent",
                                  transition:
                                    "transform 0.2s, background-color 0.3s",
                                }}
                                onClick={() => handleLike(review._id)}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.2)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              >
                                <FaThumbsUp
                                  style={{
                                    color:
                                      userActions[review._id] === "like"
                                        ? "#fff"
                                        : "rgb(0, 123, 255)",
                                  }}
                                />
                              </Button>
                              <span
                                style={{
                                  fontSize: "0.9rem",
                                  color: "rgb(108, 117, 125)",
                                  fontWeight: "bold",
                                  marginLeft: "5px",
                                  transition: "all 0.2s",
                                }}
                              >
                                {review.likes || 0}
                              </span>
                            </div>

                            {/* Dislike Button */}
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Button
                                variant="light"
                                size="sm"
                                style={{
                                  borderRadius: "50%",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                  border: "2px solid #dc3545",
                                  backgroundColor:
                                    userActions[review._id] === "dislike"
                                      ? "#dc3545"
                                      : "transparent",
                                  transition:
                                    "transform 0.2s, background-color 0.3s",
                                }}
                                onClick={() => handleDislike(review._id)}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.2)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              >
                                <FaThumbsDown
                                  style={{
                                    color:
                                      userActions[review._id] === "dislike"
                                        ? "#fff"
                                        : "#dc3545",
                                  }}
                                />
                              </Button>
                              <span
                                style={{
                                  fontSize: "0.9rem",
                                  color: "#dc3545",
                                  fontWeight: "bold",
                                  marginLeft: "5px",
                                  transition: "all 0.2s",
                                }}
                              >
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Carousel.Item>
              ))}
            </Carousel>
          </>
        )}
      </Container>
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        centered
        style={{
          borderRadius: "1rem",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Modal.Header
          closeButton
          style={{
            borderBottom: "none",
            paddingBottom: 0,
            textAlign: "center",
          }}
        >
          <Modal.Title style={{ fontWeight: "bold", width: "100%" }}>
            Add Your Review
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#6c757d",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            Rate your experience on a scale of 1 to 10. Click on the stars to
            select your rating and leave a review.
          </p>
          <Form>
            <Form.Group controlId="rating" className="mb-4">
              <Form.Label
                style={{
                  fontSize: "1.1rem",
                  color: "#495057",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Rating:{" "}
                <span
                  style={{
                    color: `hsl(${(rating / 10) * 120}, 70%, 50%)`,
                    fontWeight: "bold",
                  }}
                >
                  {rating} / 10
                </span>
              </Form.Label>

              {/* Star Rating Component */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <div
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      fontSize: "1.5rem",
                      color:
                        star <= rating
                          ? `hsl(${(rating / 10) * 120}, 70%, 50%)`
                          : "#ddd",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {star <= rating ? <FaStar /> : <FaRegStar />}
                  </div>
                ))}
              </div>
            </Form.Group>

            <Form.Group controlId="reviewText" className="mb-4">
              <Form.Label
                style={{
                  fontSize: "1.1rem",
                  color: "#495057",
                  fontWeight: "bold",
                }}
              >
                Review
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                style={{
                  border: "1px solid #ced4da",
                  borderRadius: "0.75rem",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            borderTop: "none",
            paddingTop: 0,
            justifyContent: "center",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowReviewModal(false)}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              fontWeight: "600",
              fontSize: "1rem",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            disabled={addingReview}
            onClick={handleAddReview}
            style={{
              marginLeft: "0.5rem",
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              fontWeight: "600",
              fontSize: "1rem",
              backgroundColor: "#007bff",
              borderColor: "#007bff",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      ;{/* Language Selection Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <Modal.Header
          closeButton
          style={{
            color: "#fff",
            borderBottom: "none",
          }}
        >
          <Modal.Title style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
            Select Language
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            padding: "20px 15px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            {movie.languages.map((language: string) => (
              <Button
                key={language}
                style={{
                  backgroundColor: "rgb(147, 147, 147)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "25px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(255, 64, 129, 0.4)",
                  transition: "transform 0.3s, background-color 0.3s",
                }}
                onClick={() => handleLanguageSelect(language)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0d6efd")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(147, 147, 147)")
                }
              >
                {language}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MovieDetailScreen;
