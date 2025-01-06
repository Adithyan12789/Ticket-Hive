import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import {
  useGetScreenByIdQuery,
  useUpdateSeatAvailabilityMutation,
} from "../../Slices/UserApiSlice";
import Loader from "../../Components/UserComponents/Loader";
import { toast } from "react-toastify";
import { Seat, ScreenDetails } from "../../Types/ScreenTypes";
import Footer from "../../Components/UserComponents/Footer";
import Swal from 'sweetalert2';
import styles from './select-seat-page.module.css';

const SelectSeatPage: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [, setLayout] = useState<Seat[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateSeatAvailability] = useUpdateSeatAvailabilityMutation();

  const { data, refetch, isLoading, isError } = useGetScreenByIdQuery(screenId);

  let screenDetails: ScreenDetails | null = null;

  if (data) {
    screenDetails = data as ScreenDetails;
  }

  const location = useLocation();

  const { date, movieTitle, movieId, theaterId, showTime } =
    location.state || {};

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = screenDetails && screenDetails.screen
      ? `Screen - ${screenDetails.screen.screenNumber} - Select Seats`
      : "Select Seats";
    refetch();
  }, [screenDetails, refetch]);  

  useEffect(() => {
    if (screenDetails && screenDetails.schedule) {
      let selectedSchedule = screenDetails.schedule.find(
        (schedule) =>
          new Date(schedule.date).toDateString() === date.toDateString() &&
          schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
      );

      if (!selectedSchedule) {
        selectedSchedule = screenDetails.schedule.find(
          (schedule) =>
            schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
        );
      }

      if (selectedSchedule) {
        const selectedShowTime = selectedSchedule.showTimes.find(
          (st) => st.time === showTime && st.movieTitle === movieTitle
        );
        if (selectedShowTime) {
          setLayout(selectedShowTime.layout);
        } else {
          toast.error("Show time not found.");
        }
      } else {
        toast.error("Schedule not found.");
      }
    } else {
      setLayout(generateSeatNames(5, 8));
    }
  }, [screenDetails, date, movieTitle, showTime]);

  const generateSeatNames = (rows: number, cols: number): Seat[][] => {
    const layout: Seat[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: Seat[] = [];
      const rowPrefix = String.fromCharCode(65 + (i % 26));
      for (let j = 1; j <= cols; j++) {
        row.push({
          label: `${rowPrefix}${j.toString().padStart(2, "0")}`,
          holdSeat: false,
          isAvailable: false,
        });
      }
      layout.push(row);
    }
    return layout;
  };

  const handleSeatSelection = (
    seatLabel: string,
    isAvailable: boolean,
    holdSeat: boolean
  ) => {
    if (!isAvailable || holdSeat) return;
    const newSelectedSeats = new Set(selectedSeats);
    if (newSelectedSeats.has(seatLabel)) {
      newSelectedSeats.delete(seatLabel);
    } else {
      newSelectedSeats.add(seatLabel);
      setTimeout(() => {
        newSelectedSeats.delete(seatLabel);
        setSelectedSeats(newSelectedSeats);
      }, 10 * 60 * 1000);
    }
    setSelectedSeats(newSelectedSeats);
  };

  const renderScreenLayout = () => {
    if (!screenDetails) return <p>No seat layout available for this screen.</p>;

    const selectedSchedule = screenDetails?.schedule?.find(
      (schedule) =>
        new Date(schedule.date).toDateString() === date.toDateString() &&
        schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
    ) || screenDetails?.schedule?.find(
      (schedule) =>
        schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
    );

    const selectedShowTime = selectedSchedule?.showTimes.find(
      (st) => st.time === showTime && st.movieTitle === movieTitle
    );

    return (
      <div className={styles.screenLayout}>
        {selectedShowTime?.layout.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={`${styles.row} ${
              rowIndex === 1
                ? styles.secondRow
                : rowIndex === Math.floor(selectedShowTime.layout.length / 2)
                ? styles.middleRow
                : ''
            }`}
          >
            {row.map((seat, seatIndex) => (
              <React.Fragment key={`seat-${seatIndex}`}>
                {seatIndex === Math.floor(row.length / 2) && (
                  <div className={styles.seatGap}></div>
                )}
                <button
                  className={`${styles.seat} ${
                    selectedSeats.has(seat.label)
                      ? styles.selected
                      : seat.isAvailable && !seat.holdSeat
                      ? styles.available
                      : styles.unavailable
                  }`}
                  onClick={() =>
                    handleSeatSelection(
                      seat.label,
                      seat.isAvailable,
                      seat.holdSeat
                    )
                  }
                  disabled={!seat.isAvailable}
                >
                  {seat.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        ))}
        <div className={styles.screen}></div>
        <div className={styles.screenText}>
          <p>All eyes this way please!</p>
        </div>
      </div>
    );
  };

  const totalSeats = selectedSeats.size;
  const ticketPrice = screenDetails?.theater?.ticketPrice || 0;
  const totalPrice = totalSeats * ticketPrice;

  if (loading || isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching seat data.");
    return <div>Error fetching seat data.</div>;
  }

  const selectedSchedule = screenDetails?.schedule.find(
    (schedule) =>
      new Date(schedule.date).toDateString() === date.toDateString() &&
      schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
  ) || screenDetails?.schedule?.find(
    (schedule) =>
      schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
  );

  const scheduleId = selectedSchedule?._id;

  const handleSeatUpdate = async () => {
    if (!screenDetails || !showTime) {
      toast.error("Error: Unable to find schedule.");
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Seat Selection',
      html: `
        <p>You have selected ${totalSeats} seat(s).</p>
        <p>Total Price: Rs.${totalPrice}</p>
        <p>Do you want to proceed with the payment?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await updateSeatAvailability({
          scheduleId: scheduleId, 
          selectedSeats: [...selectedSeats],
          holdSeat: true,
          showTime,
        }).unwrap();

        navigate("/booking", {
          state: {
            selectedSeats: [...selectedSeats],
            theaterName: screenDetails?.theater.name,
            date: formattedDate,
            movieTitle: movieTitle,
            totalPrice: totalPrice,
            movieId: movieId,
            theaterId: theaterId,
            screenId: screenId,
            showTime: showTime,
            scheduleId: scheduleId,
          },
        });

        setTimeout(async () => {
          try {
            await updateSeatAvailability({
              scheduleId,
              selectedSeats: [...selectedSeats],
              holdSeat: false,
              showTime,
            }).unwrap();
            console.log("Seat availability reset to true.");
          } catch (error) {
            console.error("Error resetting seat availability:", error);
          }
        }, 60000);
      } catch (error) {
        console.log("error: ", error);
        toast.error("Unable to update seat availability. Please try again.");
      }
    }
  };

  return (
    <>
      <Container className={styles.container}>
        <Row className={styles.header}>
          <Col>
            <div className={styles.headerContent}>
              <FaArrowLeft
                onClick={() => navigate(-1)}
                className={styles.backArrow}
              />
              <div>
                <span className={styles.movieTitle}>
                  {movieTitle || "Movie Title"}
                </span>
                <span className={styles.movieRating}>
                  UA
                </span>
              </div>
            </div>
          </Col>
        </Row>
        <Row className={styles.theaterInfo}>
          <Col>
            <div>
              Screen {screenDetails?.screen.screenNumber}
              <br />
              {screenDetails?.theater.name || "Theater Name"} |{" "}
              {formattedDate || "Show Date"}
            </div>
          </Col>
        </Row>
        <Row>{renderScreenLayout()}</Row>
        {selectedSeats.size > 0 && (
          <div className={styles.paymentBar}>
            <Button
              className={styles.paymentButton}
              variant="primary"
              onClick={handleSeatUpdate}
            >
              <div>
                <div>Pay Rs.{totalPrice}</div>
                <div className={styles.ticketCount}>
                  {totalSeats} {totalSeats === 1 ? "ticket" : "tickets"}
                </div>
              </div>
            </Button>
          </div>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default SelectSeatPage;
