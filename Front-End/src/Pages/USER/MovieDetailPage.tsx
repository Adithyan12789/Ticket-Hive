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
import Footer from "../../Components/UserComponents/Footer";
import { backendUrl } from "../../url"

const USER_MOVIE_POSTER = `${backendUrl}/MoviePosters/`;
const USER_MOVIE_IMAGES = `${backendUrl}/movieImages/`;
const USER_MOVIE_CAST_IMAGES = `${backendUrl}/CastsImages/`;

interface Review {
  _id: string;
  user: {
    _id: string;
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

  console.log("reviews: ", reviews);

  const [addReview, { isLoading: addingReview }] = useAddReviewMutation();

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

  const hasReviewed = reviews?.some(
    (review: Review) => review.user && review.user._id === userId
  );

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
      <style type="text/css">
        {`
          .movie-detail-container {
            padding: 20px;
            left: 50%;
            transform: translateX(-50%);
          }
          .movie-poster {
            max-width: 100%;
            height: auto;
          }
          .movie-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: white;
          }
          .movie-info {
            font-size: 1rem;
          }
          .rating-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
          }
          .average-rating-label {
            font-size: 1rem;
          }
          .average-rating-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #f39c12;
            margin-left: 10px;
          }
          .no-reviews {
            font-size: 1rem;
          }
          .rate-now-btn {
            background-color: #fff;
            color: #007bff;
            border: 1px solid #007bff;
            border-radius: 5px;
            padding: 5px 15px;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          .rate-now-btn:hover {
            background-color: #007bff;
            color: #fff;
          }
          .book-tickets-btn {
            width: 100%;
            padding: 10px 20px;
            font-size: 18px;
            margin-top: 20px;
            background-color: rgb(255, 64, 129);
          }

          @media (max-width: 768px) {
            .movie-detail-container {
              position: relative;
              top: 0;
              left: 0;
              transform: none;
              padding: 15px;
              height: 500px;
              width: 500px;
            }
            .movie-title {
              font-size: 2rem;
              color: white;
            }
            .movie-info {
              font-size: 0.9rem;
            }
            .rating-container {
              flex-direction: column;
              align-items: flex-start;
            }
            .rate-now-btn {
              margin-top: 10px;
            }
          }
        `}
      </style>
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
          className="movie-detail-container"
          style={{
            position: "absolute",
            zIndex: 2,
            color: "#fff",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            width: "100%",
            maxWidth: "700px",
          }}
        >
          <Row className="g-4">
            <Col xs={12} md={5} className="text-center text-md-start">
              <img
                src={`${USER_MOVIE_POSTER}${movie.posters}`}
                alt={movie.title}
                className="img-fluid movie-poster"
                style={{
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
            <Col xs={12} md={7}>
              <h2 className="movie-title">{movie.title}</h2>
              <p className="movie-info">{movie.genres.join(", ")}</p>
              <p className="movie-info">
                {movie.languages.join(", ")} | {movie.duration} |{" "}
                {new Date(movie.releaseDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {/* Display Average Rating and Add Review Button */}
              <div className="rating-container">
                {averageRating > 0 ? (
                  <>
                    <div className="d-flex align-items-center">
                      <span className="average-rating-label">
                        Average Rating:{" "}
                      </span>
                      <span className="average-rating-value">
                        {renderStars(Math.round(averageRating))}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="no-reviews">No reviews yet</span>
                )}

                {!hasReviewed && (
                  <Button
                    variant="secondary"
                    className="rate-now-btn"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Rate now
                  </Button>
                )}
              </div>

              <Button
                variant="danger"
                className="book-tickets-btn"
                onClick={handleBookNow}
              >
                Book Tickets
              </Button>
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
      {reviewsState.length > 0 && (
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
                {reviewsState?.map((review: Review) => (
                  <Carousel.Item key={review?._id}>
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
                                  {review.user?.name}
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
                                    (e.currentTarget.style.transform =
                                      "scale(1)")
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
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
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
                                    (e.currentTarget.style.transform =
                                      "scale(1)")
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
                                ></span>
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
      )}
      <Footer />
      {/* Review Modal */}
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Your Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Rate your experience on a scale of 1 to 10. Click on the stars to
            select your rating and leave a review.
          </p>
          <Form>
            <Form.Group controlId="rating" className="mb-3">
              <Form.Label className="d-flex justify-content-between">
                Rating:{" "}
                <span className="text-primary">
                  {rating} / 10
                </span>
              </Form.Label>
              <div className="d-flex justify-content-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <div
                    key={star}
                    onClick={() => setRating(star)}
                    style={{ cursor: "pointer" }}
                  >
                    {star <= rating ? (
                      <FaStar className="text-warning" size={24} />
                    ) : (
                      <FaRegStar size={24} />
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>
            <Form.Group controlId="reviewText" className="mb-3">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={addingReview}
            onClick={handleAddReview}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Language Selection Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Language</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {movie.languages.map((language: string) => (
              <Col key={language} xs={6} sm={4} className="mb-3">
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => handleLanguageSelect(language)}
                >
                  {language}
                </Button>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MovieDetailScreen;

