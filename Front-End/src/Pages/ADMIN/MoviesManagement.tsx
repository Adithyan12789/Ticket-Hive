import React, {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
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
import {
  useAddMovieMutation,
  useGetMoviesMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} from "../../Slices/AdminApiSlice";
import { toast } from "react-toastify";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import MovieOwnerLayout from "../../Components/AdminComponents/AdminLayout";
import Loader from "../../Components/UserComponents/Loader";
import {
  GenreOption,
  LanguageOption,
  MovieManagement,
} from "../../Types/MoviesTypes";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";

const MOVIE_IMAGES_DIR_PATH = "http://localhost:5000/MoviePosters/";

const MovieManagementScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setEditShowModal] = useState<boolean>(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [, setDuration] = useState("");
  const [selectedPoster, setSelectedPoster] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedCastsImages, setSelectedCastsImages] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [casts, setCasts] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [movies, setMovies] = useState<MovieManagement[]>([]);
  const [director, setDirector] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addMovie] = useAddMovieMutation();
  const [editMovie] = useUpdateMovieMutation();
  const [deleteMovie] = useDeleteMovieMutation();
  const navigate = useNavigate();
  const [getMovies, { isLoading }] = useGetMoviesMutation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(3);
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => {
    setShowModal(false);
    resetFormFields();
  };

  const handleEditModalShow = (movie: MovieManagement) => {
    if (!movie) {
      console.error("Movie object is undefined");
      return;
    }

    setEditingMovieId(movie._id);
    setTitle(movie.title);

    setGenres(movie.genre ? movie.genre.split(",") : []);
    const durationMatch = movie.duration.match(/(\d+)h\s(\d+)m/);
    setHours(durationMatch?.[1] || "");
    setMinutes(durationMatch?.[2] || "");
    setDescription(movie.description);
    setCasts(movie.casts);
    setReleaseDate(movie.releaseDate.toString());

    setLanguages(movie.language ? movie.language.split(",") : []);

    setSelectedPoster(null);

    setDirector(movie.director);

    setEditShowModal(true);
  };

  const handleEditModalClose = () => {
    setEditShowModal(false);
    resetFormFields();
    setEditingMovieId(null);
  };

  const resetFormFields = () => {
    setTitle("");
    setGenres([""]);
    setDuration("");
    setDescription("");
    setLanguages([""]);
    setCasts([""]);
    setDirector("");
    setReleaseDate("");
    setSelectedPoster(null); // Reset single file
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await getMovies({}).unwrap();
      setMovies(response.movies || []); // Adjust for response structure
      if ((response.movies || []).length === 0) {
        handleModalShow();
      }
    } catch (err) {
      console.error("Error fetching movies", err);
    }
  }, [getMovies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePosterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null; // Only take the first selected file
    if (file && !file.type.startsWith("image/")) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedPoster(file);
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedImages(validImages);
  };

  const handleCastsImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedCastsImages(validImages);
  };

  console.log("handleImagesChange: ", handleImagesChange);
  console.log("handleCastsImagesChange: ", handleCastsImagesChange);

  const handleDelete = async (movieId: string) => {
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
        await deleteMovie({ id: movieId }).unwrap();
        toast.success("Movie deleted successfully");
        fetchData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  useEffect(() => {
    const fetchGenresAndLanguages = async () => {
      setLoading(true);

      try {
        const genreResponse = await axios.get(
          "https://api.themoviedb.org/3/genre/movie/list",
          {
            params: {
              api_key: "0ffb386a852dbf070ac6b977313d8039",
              language: "en-US",
            },
          }
        );

        const languageResponse = await axios.get(
          "https://api.themoviedb.org/3/configuration/languages",
          {
            params: {
              api_key: "0ffb386a852dbf070ac6b977313d8039",
            },
          }
        );

        setGenreOptions(genreResponse.data.genres || []);
        setLanguageOptions(languageResponse.data || []);
      } catch (error) {
        console.error("Error fetching genres and languages:", error);
        toast.error("Failed to fetch genres and languages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGenresAndLanguages();
  }, []);

  const getGenreNames = (selectedGenres: string[]) => {
    return selectedGenres.map((id) => {
      const genre = genreOptions.find((g) => g.id.toString() === id);
      return genre ? genre.name : id; // Return genre name or id if not found
    });
  };

  const validateTitle = (value: string) => /^[A-Za-z0-9\s'-]+$/.test(value);
  const validateDuration = (value: string) => /^\d+h\s\d+m$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDuration = `${hours}h ${minutes}m`;
    setDuration(formattedDuration);

    const trimmedTitle = title.trim();
    const trimmedGenres = getGenreNames(genres.map((genre) => genre.trim()));
    const trimmedDuration = formattedDuration.trim();
    const trimmedDescription = description.trim();
    const trimmedDirector = director.trim();
    const trimmedLanguages = languages.map((language) => language.trim());
    const trimmedCasts = casts.map((cast) => cast.trim());
    const trimmedReleaseDate = releaseDate.trim();

    if (
      !trimmedTitle ||
      trimmedGenres.length === 0 ||
      !trimmedDuration ||
      !selectedImages.length ||
      !selectedPoster ||
      !trimmedDescription ||
      !trimmedDirector ||
      trimmedLanguages.length === 0 ||
      !trimmedCasts.length ||
      !selectedCastsImages.length ||
      !trimmedReleaseDate
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!validateTitle(trimmedTitle)) {
      toast.error("Invalid characters in title");
      return;
    }

    if (!validateDuration(trimmedDuration)) {
      toast.error(
        "Invalid duration format, please select valid hours and minutes"
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", trimmedTitle);
      trimmedGenres.forEach((genre) => formData.append("genre[]", genre));
      formData.append("duration", trimmedDuration);
      formData.append("description", trimmedDescription);
      formData.append("director", trimmedDirector);
      trimmedLanguages.forEach((language) =>
        formData.append("language[]", language)
      );
      trimmedCasts.forEach((cast) => formData.append("casts[]", cast));
      formData.append("releaseDate", trimmedReleaseDate);

      if (selectedPoster) {
        formData.append("poster", selectedPoster);
      }

      selectedImages.forEach((image) => formData.append("movieImages", image));
      selectedCastsImages.forEach((castImage) =>
        formData.append("castImages", castImage)
      );

      console.log("formData: ", formData);

      await addMovie(formData).unwrap();
      toast.success("Movie added successfully");
      handleModalClose();
      navigate("/admin/get-movies");
      fetchData();
    } catch (err) {
      console.error("Error adding movie: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDuration = `${hours}h ${minutes}m`;
    setDuration(formattedDuration);

    const trimmedTitle = title.trim();
    const trimmedGenres = getGenreNames(genres.map((genre) => genre.trim()));
    const trimmedDuration = formattedDuration.trim();
    const trimmedDescription = description.trim();
    const trimmedDirector = director.trim();
    const trimmedLanguages = languages.map((language) => language.trim());
    const trimmedCasts = casts.map((cast) => cast.trim());
    const trimmedReleaseDate = releaseDate.trim();

    if (
      !trimmedTitle ||
      trimmedGenres.length === 0 ||
      !trimmedDuration ||
      !selectedImages.length ||
      !selectedPoster ||
      !trimmedDescription ||
      !trimmedDirector ||
      trimmedLanguages.length === 0 ||
      !trimmedCasts.length ||
      !selectedCastsImages.length ||
      !trimmedReleaseDate
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!validateTitle(trimmedTitle)) {
      toast.error("Invalid characters in title");
      return;
    }

    if (!validateDuration(trimmedDuration)) {
      toast.error(
        "Invalid duration format, please select valid hours and minutes"
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", trimmedTitle);
      trimmedGenres.forEach((genre) => formData.append("genre[]", genre));
      formData.append("duration", trimmedDuration);
      formData.append("description", trimmedDescription);
      formData.append("director", trimmedDirector);
      trimmedLanguages.forEach((language) =>
        formData.append("language[]", language)
      );
      trimmedCasts.forEach((cast) => formData.append("casts[]", cast));
      formData.append("releaseDate", trimmedReleaseDate);

      if (selectedPoster) {
        formData.append("poster", selectedPoster);
      }

      selectedImages.forEach((image) => formData.append("movieImages", image));
      selectedCastsImages.forEach((castImage) =>
        formData.append("castImages", castImage)
      );

      await editMovie({ id: editingMovieId, formData }).unwrap();
      toast.success("Movie updated successfully");
      handleEditModalClose();
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  console.log("currentMovies: ", movies);

  const totalPages = Math.ceil(movies.length / itemsPerPage);

  if (isLoading || loading) return <Loader />;

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MovieOwnerLayout adminName={""}>
      <Container className="px-5 w-78" style={{ maxHeight: "100vh" }}>
        <Row className="justify-content-between align-items-center mb-3">
          <Col md={6} className="d-flex pt-4">
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Search movies by title"
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
              Add Movie
            </Button>
          </Col>
        </Row>

        {/* Add Movie Modal */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Movie</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="title" className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter movie title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="genre" className="mb-3">
                    <Form.Label>Genre</Form.Label>
                    <Select
                      isMulti
                      options={genreOptions.map((option) => ({
                        value: option.id.toString(),
                        label: option.name,
                      }))}
                      value={genres.map((genre) => ({
                        value: genre.toString(),
                        label: genreOptions.find(
                          (option) => option.id.toString() === genre
                        )?.name,
                      }))}
                      onChange={(selectedOptions) => {
                        setGenres(
                          selectedOptions.map((option) => option.value)
                        );
                      }}
                      placeholder="Select genre(s)"
                    />
                  </Form.Group>

                  <Form.Group controlId="duration" className="mb-3">
                    <Form.Label>Duration</Form.Label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Form.Select
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        aria-label="Select hours"
                      >
                        <option value="">Hours</option>
                        {[...Array(10).keys()].map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}h
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Select
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        aria-label="Select minutes"
                      >
                        <option value="">Minutes</option>
                        {[0, 15, 30, 45].map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}m
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Form.Group>

                  <Form.Group controlId="language" className="mb-3">
                    <Form.Label>Language</Form.Label>
                    <Select
                      isMulti
                      options={languageOptions.map((option) => ({
                        value: option.iso_639_1,
                        label: option.english_name,
                      }))}
                      value={languages.map((language) => ({
                        value: language,
                        label: languageOptions.find(
                          (option) => option.iso_639_1 === language
                        )?.english_name,
                      }))}
                      onChange={(selectedOptions) => {
                        setLanguages(
                          selectedOptions.map((option) => option.value)
                        );
                      }}
                      placeholder="Select language(s)"
                    />
                  </Form.Group>

                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Poster</Form.Label>
                    <Form.Control
                      type="file"
                      name="poster"
                      onChange={handlePosterChange}
                      accept="image/*"
                    />
                    {selectedPoster && (
                      <img
                        src={URL.createObjectURL(selectedPoster)}
                        alt="Selected poster"
                        style={{
                          width: "50%",
                          height: "auto",
                          marginTop: "10px",
                        }}
                      />
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Movie Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      name="movieImages"
                      onChange={handleImagesChange}
                      accept="image/*"
                    />
                    {selectedImages && (
                      <div className="mt-2">
                        {selectedImages.map((image, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(image)}
                            alt={`Selected image ${index + 1}`}
                            style={{
                              width: "50%",
                              height: "auto",
                              margin: "5px",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group controlId="director" className="mb-3">
                    <Form.Label>Director</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter director's name"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="casts" className="mb-3">
                    <Form.Label>Casts</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter casts (comma-separated)"
                      value={casts.join(", ")}
                      onChange={(e) =>
                        setCasts(
                          e.target.value.split(",").map((cast) => cast.trim())
                        )
                      }
                    />
                  </Form.Group>

                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Cast Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      name="castImages"
                      onChange={handleCastsImagesChange}
                      accept="image/*"
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {selectedCastsImages &&
                        selectedCastsImages.length > 0 && (
                          <div className="mt-2">
                            {selectedCastsImages.map((image, index) => (
                              <img
                                key={index}
                                src={URL.createObjectURL(image)}
                                alt={`Cast image ${index + 1}`}
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  marginBottom: "10px",
                                  objectFit: "cover",
                                  borderRadius: "5px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="releaseDate" className="mb-3">
                    <Form.Label>Release Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit" className="mt-2">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Edit Movie Modal */}
        <Modal
          show={showEditModal}
          onHide={handleEditModalClose}
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Movie</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="title" className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter movie title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Form.Group>

                  {/* Genre Selection using Select component */}
                  <Form.Group controlId="genre" className="mb-3">
                    <Form.Label>Genre</Form.Label>
                    <Select
                      isMulti
                      options={genreOptions.map((option) => ({
                        value: option.id.toString(),
                        label: option.name,
                      }))}
                      value={genres.map((genre) => ({
                        value: genre.toString(),
                        label: genreOptions.find(
                          (option) => option.id.toString() === genre
                        )?.name,
                      }))}
                      onChange={(selectedOptions) => {
                        setGenres(
                          selectedOptions.map((option) => option.value)
                        );
                      }}
                      placeholder="Select genre(s)"
                    />
                  </Form.Group>

                  <Form.Group controlId="duration" className="mb-3">
                    <Form.Label>Duration</Form.Label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Form.Select
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        aria-label="Select hours"
                      >
                        <option value="">Hours</option>
                        {[...Array(10).keys()].map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}h
                          </option>
                        ))}
                      </Form.Select>

                      <Form.Select
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        aria-label="Select minutes"
                      >
                        <option value="">Minutes</option>
                        {[0, 15, 30, 45].map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}m
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Form.Group>

                  {/* Language Selection using Select component */}
                  <Form.Group controlId="language" className="mb-3">
                    <Form.Label>Language</Form.Label>
                    <Select
                      isMulti
                      options={languageOptions.map((option) => ({
                        value: option.iso_639_1,
                        label: option.english_name,
                      }))}
                      value={languages.map((language) => ({
                        value: language,
                        label: languageOptions.find(
                          (option) => option.iso_639_1 === language
                        )?.english_name,
                      }))}
                      onChange={(selectedOptions) => {
                        setLanguages(
                          selectedOptions.map((option) => option.value)
                        );
                      }}
                      placeholder="Select language(s)"
                    />
                  </Form.Group>

                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Poster</Form.Label>
                    <Form.Control
                      name="poster"
                      type="file"
                      onChange={handlePosterChange}
                      accept="image/*"
                    />
                    {selectedPoster && (
                      <img
                        src={URL.createObjectURL(selectedPoster)}
                        alt="Selected poster"
                        style={{
                          width: "50%",
                          height: "auto",
                          marginTop: "10px",
                        }}
                      />
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Movie Images</Form.Label>
                    <Form.Control
                      name="movieImages"
                      type="file"
                      multiple
                      onChange={handleImagesChange}
                      accept="image/*"
                    />
                    {selectedImages && selectedImages.length > 0 && (
                      <div className="mt-2">
                        {selectedImages.map((image, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(image)}
                            alt={`Selected image ${index + 1}`}
                            style={{
                              width: "50%",
                              height: "auto",
                              margin: "5px",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group controlId="director" className="mb-3">
                    <Form.Label>Director</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter director name"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="casts" className="mb-3">
                    <Form.Label>Casts</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter casts (comma-separated)"
                      value={casts.join(", ")}
                      onChange={(e) =>
                        setCasts(
                          e.target.value.split(",").map((cast) => cast.trim())
                        )
                      }
                    />
                  </Form.Group>

                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Cast Images</Form.Label>
                    <Form.Control
                      name="castImages"
                      type="file"
                      multiple
                      onChange={handleCastsImagesChange}
                      accept="image/*"
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {selectedCastsImages &&
                        selectedCastsImages.length > 0 && (
                          <div className="mt-2">
                            {selectedCastsImages.map((image, index) => (
                              <img
                                key={index}
                                src={URL.createObjectURL(image)}
                                alt={`Cast image ${index + 1}`}
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  marginBottom: "10px",
                                  objectFit: "cover",
                                  borderRadius: "5px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="releaseDate" className="mb-3">
                    <Form.Label>Release Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit" className="mt-2">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Movies Listing */}
        <Row>
          {filteredMovies.length > 0 ? (
            filteredMovies
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((movie) => (
                <Col key={movie._id} md={4} className="mb-4">
                  <Card style={{ height: "610px" }}>
                    <Link
                      to={`/admin/movie-details/${movie?._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Card.Img
                        style={{ height: "430px" }}
                        variant="top"
                        src={`${MOVIE_IMAGES_DIR_PATH}${movie.posters}`}
                        alt={movie.title}
                      />
                    </Link>
                    <Card.Body>
                      <Card.Title>{movie.title}</Card.Title>
                      <Card.Text>{movie.genres.join(", ")}</Card.Text>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <Button
                          variant="info"
                          className="icon-button"
                          onClick={() => handleEditModalShow(movie)}
                        >
                          <FaEdit />
                        </Button>

                        <Button
                          variant="danger"
                          className="icon-button"
                          onClick={() => handleDelete(movie._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
          ) : (
            <Col>
              <p>No movies available.</p>
            </Col>
          )}
        </Row>

        {/* Pagination */}
        <Pagination>
          {Array.from({ length: totalPages }, (_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </Container>
    </MovieOwnerLayout>
  );
};

export default MovieManagementScreen;
