import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Modal } from "react-bootstrap";
import { FaRegCalendarAlt, FaFilm, FaTicketAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useCreateBookingMutation,
  useGetTransactionHistoryQuery,
} from "../../Slices/UserApiSlice";
import { loadScript } from "../../Utils/LoadScript";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Loader from "../../Components/UserComponents/Loader";
import { RazorpayOptions, RazorpayPaymentObject } from "../../Global";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
import { LocationState, Transaction } from "../../Types/WalletTypes";
import Footer from "../../Components/UserComponents/Footer";

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  console.log("user info: ", userInfo);

  const { movieId, theaterId, screenId, showTime, movieTitle } =
    location.state || {};
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { data } = useGetTransactionHistoryQuery(userInfo?.id);

  const transactions: Transaction[] = Array.isArray(
    data?.transactions?.transactions
  )
    ? data.transactions.transactions
    : [];

  const walletBalance: number =
    data?.transactions?.balance ||
    transactions.reduce(
      (total, transaction) =>
        transaction.type === "credit"
          ? total + transaction.amount
          : total - transaction.amount,
      0
    );

  console.log("booking page movieId: ", movieId);
  console.log("booking page theaterId: ", theaterId);
  console.log("booking page screenId: ", screenId);

  const {
    selectedSeats = [],
    theaterName = "Unknown Theater",
    date = new Date().toISOString(),
    totalPrice = 0,
  } = location.state as LocationState;

  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "paypal" | "wallet" | null
  >(null);

  const convenienceFee = totalPrice * 0.1;
  const finalPrice = totalPrice + convenienceFee;
  const formattedDate = new Date(date || "").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Ticket Booking`
  }, []);

  const handleRazorpayPayment = async () => {
    setPaymentMethod("razorpay");

    const scriptLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!scriptLoaded) {
      Swal.fire(
        "Error",
        "Razorpay SDK failed to load. Check your internet connection.",
        "error"
      );
      return;
    }

    const razorpayApiKey = "rzp_test_Oks5Gpac00wL72";

    if (!razorpayApiKey) {
      Swal.fire(
        "Error",
        "Razorpay API Key is missing. Please configure it in your environment variables.",
        "error"
      );
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayApiKey,
      amount: finalPrice * 100,
      currency: "INR",
      name: "TicketHive",
      description: "Movie Ticket Booking",
      handler: async (response: { razorpay_payment_id: string }) => {
        Swal.fire(
          "Payment Successful",
          "Your payment has been completed.",
          "success"
        );
        await handleCreateBooking("razorpay");
        navigate("/thankyou", {
          state: { paymentId: response.razorpay_payment_id },
        });
      },
      prefill: {
        name: "John Doe",
        email: "johndoe@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#457b9d",
      },
    };

    const RazorpayConstructor = window.Razorpay as new (
      options: RazorpayOptions
    ) => RazorpayPaymentObject;
    const paymentObject = new RazorpayConstructor(options);
    paymentObject.open();
  };

  const handleCreateBooking = async (method: string) => {
    try {
      console.log("entered to booking function");

      const bookingData = {
        userId: userInfo?.id,
        movieId: movieId,
        theaterId: theaterId,
        seatIds: selectedSeats,
        screenId: screenId,
        bookingDate: formattedDate,
        showTime,
        totalPrice,
        paymentStatus: "pending",
        paymentMethod: method,
        convenienceFee,
      };

      console.log("bookingData: ", bookingData);

      await createBooking(bookingData).unwrap();
      Swal.fire(
        "Booking Successful",
        "Your booking has been successfully processed.",
        "success"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Booking Error:", err);
      Swal.fire(
        "Booking Failed",
        `There was an error processing your booking: ${
          err?.message || "Unknown error occurred"
        }`,
        "error"
      );
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < finalPrice) {
      setInsufficientFunds(true);
      Swal.fire(
        "Insufficient Funds",
        "You don't have enough wallet balance to complete the payment.",
        "error"
      );
      return;
    }

    // Proceed with Wallet Payment
    setPaymentMethod("wallet");

    try {
      // Deduct wallet balance
      await handleCreateBooking("wallet");
      Swal.fire(
        "Payment Successful",
        "Your wallet payment has been completed.",
        "success"
      );

      // Redirect to Thank You Page
      navigate("/thankyou", {
        state: { paymentId: `WALLET-${new Date().getTime()}` },
      });
    } catch (error) {
      console.log("An error occurred during wallet payment. Please try again", error);
      
      Swal.fire(
        "Payment Error",
        "An error occurred during wallet payment. Please try again.",
        "error"
      );
    }
  };

  const handleProceed = (method: "razorpay" | "paypal" | "wallet") => {
    setPaymentMethod(method);
    setShowModal(false);
  };

  return (
    <><Container className="mt-5" style={{ maxWidth: "800px" }}>
      <h2
        className="text-center mb-5"
        style={{
          fontSize: "36px",
          fontWeight: "500",
          color: "#4e89ae", // Subtle professional color
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Booking Summary
      </h2>

      <Card
        className="rounded-lg border-0"
        style={{
          boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          backgroundColor: "#f8f9fa", // Light background
        }}
      >
        <Card.Body>
          <Row>
            <Col className="text-center mb-4">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <FaFilm
                  style={{
                    fontSize: "2.5rem",
                    color: "#e63946",
                    marginRight: "12px",
                  }} />
                <h4
                  style={{
                    fontWeight: "400",
                    color: "#2c3e50", // Darker text for professionalism
                    textTransform: "uppercase",
                  }}
                >
                  {movieTitle}
                </h4>
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <p
                style={{
                  fontSize: "16px",
                  color: "#6c757d",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaTicketAlt style={{ color: "#457b9d", marginRight: "8px" }} />
                {theaterName}
              </p>
            </Col>
            <Col>
              <p
                style={{
                  fontSize: "16px",
                  color: "#6c757d",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaRegCalendarAlt
                  style={{ color: "#457b9d", marginRight: "8px" }} />
                {formattedDate}
              </p>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <p style={{ fontWeight: "500", color: "#1d3557", fontSize: "16px" }}>Seats:</p>
              <p style={{ color: "#6c757d", fontSize: "16px" }}>
                {selectedSeats.length > 0
                  ? selectedSeats.join(", ")
                  : "No seats selected"}
              </p>
            </Col>
          </Row>
          <hr />
          <Row className="mb-4">
            <Col>
              <p
                style={{
                  fontSize: "16px",
                  color: "#1d3557",
                  fontWeight: "500",
                }}
              >
                Total Price (excluding convenience fee):{" "}
                <strong>Rs. {totalPrice}</strong>
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "#1d3557",
                  fontWeight: "500",
                }}
              >
                Convenience Fee (10%):{" "}
                <strong>Rs. {convenienceFee.toFixed(2)}</strong>
              </p>
              <hr />
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "1.25rem",
                  color: "#1d3557",
                }}
              >
                Amount Payable:{" "}
                <span style={{ color: "#e63946" }}>
                  Rs. {finalPrice.toFixed(2)}
                </span>
              </p>
            </Col>
          </Row>

          {/* Loading state */}
          {loading || isLoading && <Loader />}

          {/* Proceed Button */}
          {!paymentMethod && (
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                className="px-5 py-3"
                onClick={() => setShowModal(true)}
                style={{
                  background: "#4e89ae", // Professional, soft blue
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  width: "250px",
                  fontSize: "17px",
                }}
              >
                Proceed to Payment
              </Button>
            </div>
          )}

          {/* Payment Method Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Select Payment Method</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Button
                variant="outline-primary"
                className="w-100 mb-3"
                onClick={handleRazorpayPayment}
                style={{ fontSize: "16px", padding: "12px" }}
              >
                Pay with Razorpay
              </Button>
              <Button
                variant="outline-success"
                className="w-100 mb-3"
                onClick={() => handleProceed("paypal")}
                style={{ fontSize: "16px", padding: "12px" }}
              >
                Pay with PayPal
              </Button>
              <Button
                variant="outline-info"
                className="w-100"
                onClick={handleWalletPayment}
                disabled={insufficientFunds}
                style={{ fontSize: "16px", padding: "12px" }}
              >
                Pay with Wallet
              </Button>
            </Modal.Body>
          </Modal>

          {paymentMethod === "paypal" && (
            <div className="mt-3">
              <PayPalScriptProvider
                options={{
                  clientId: "AXyOd3ZlDDoSe8nOeC_frUV-ZpEkIgzQtECddqkh91w04xHxYdsZr8LXxIzKHq0_Tnk87DQlR0UaEitm",
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  createOrder={(_data, actions) => {
                    setPaymentMethod("paypal");
                    return actions.order
                      .create({
                        purchase_units: [
                          {
                            amount: {
                              value: finalPrice.toString(),
                              currency_code: "USD",
                            },
                          },
                        ],
                        intent: "CAPTURE",
                      })
                      .catch((error) => {
                        console.error("Error creating order:", error);
                        return Promise.reject(error);
                      });
                  } }
                  onApprove={async (_data, actions) => {
                    if (actions.order) {
                      try {
                        const details = await actions.order.capture();
                        console.log("PayPal Payment Details:", details);

                        Swal.fire(
                          "Payment Successful",
                          "Your PayPal payment has been completed.",
                          "success"
                        );

                        await handleCreateBooking("paypal");

                        navigate("/thankyou", {
                          state: {
                            paymentId: details.id,
                            paymentDetails: details,
                          },
                        });
                      } catch (error) {
                        console.error("Error capturing PayPal order:", error);
                        Swal.fire(
                          "Payment Error",
                          "There was an issue processing your payment. Please try again.",
                          "error"
                        );
                      }
                    } else {
                      Swal.fire(
                        "Payment Error",
                        "PayPal payment could not be processed. Please try again.",
                        "error"
                      );
                    }
                  } }
                  onError={(error) => {
                    console.error("PayPal Buttons error:", error);
                    Swal.fire(
                      "Payment Error",
                      "An error occurred during payment. Please try again.",
                      "error"
                    );
                  } } />
              </PayPalScriptProvider>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container><Footer /></>
  );
};

export default BookingPage;
