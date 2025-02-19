import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Modal } from "react-bootstrap";
import { FaRegCalendarAlt, FaFilm, FaTicketAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useCreateBookingMutation,
  useGetTransactionHistoryQuery,
  useGetOffersByTheaterIdQuery,
} from "../../Slices/UserApiSlice";
import { loadScript } from "../../Utils/LoadScript";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Loader from "../../Components/UserComponents/Loader";
import { RazorpayOptions, RazorpayPaymentObject } from "../../Global";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
import { LocationState, Transaction } from "../../Types/WalletTypes";
import Footer from "../../Components/UserComponents/Footer";
import { Offer } from "../../Types/TheaterTypes";

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  console.log("user info: ", userInfo);

  const { scheduleId, movieId, theaterId, screenId, showTime, movieTitle } =
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

  const [createBooking, { isLoading: isBookingLoading }] =
    useCreateBookingMutation();
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "paypal" | "wallet" | null
  >(null);

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
    document.title = `Ticket Booking`;
  }, []);

  const convenienceFee = totalPrice * 0.1;

  const { data: offers, isLoading: offersLoading } =
    useGetOffersByTheaterIdQuery(theaterId);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(
    totalPrice + convenienceFee
  );
  const [selectedPaymentMethods, setSelectedPaymentMethods] =
    useState<string>("");

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

    const razorpayApiKey = "rzp_test_RIuFkzXFQwkp22";

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

  const offerId = selectedOffer?._id;

  console.log("offerI: ", offerId);

  const handleCreateBooking = async (method: string) => {
    try {
      console.log("entered to booking function");

      const bookingData = {
        userId: userInfo?.id,
        scheduleId: scheduleId,
        movieId: movieId,
        theaterId: theaterId,
        seatIds: selectedSeats,
        screenId: screenId,
        offerId: offerId,
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

    setPaymentMethod("wallet");

    try {
      await handleCreateBooking("wallet");
      Swal.fire(
        "Payment Successful",
        "Your wallet payment has been completed.",
        "success"
      );

      navigate("/thankyou", {
        state: { paymentId: `WALLET-${new Date().getTime()}` },
      });
    } catch (error) {
      console.log(
        "An error occurred during wallet payment. Please try again",
        error
      );

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

  const handleOfferSelect = (offer: Offer | null) => {
    setSelectedOffer(offer);

    if (offer) {
      setShowOfferModal(true);
      const discount = offer.discountValue ? offer.discountValue : 0;
      const offerPrice = totalPrice - (totalPrice * discount) / 100;
      const newFinalPrice = offerPrice + convenienceFee;
      setFinalPrice(newFinalPrice);
      setSelectedPaymentMethods(offer.paymentMethod || "");
    } else {
      setShowOfferModal(false);
      setFinalPrice(totalPrice + convenienceFee);
      setSelectedPaymentMethods("");
    }
  };

  if (loading || isBookingLoading || offersLoading) return <Loader />;

  return (
    <>
      <Container className="mt-5">
        <Row>
          {offers && offers.length > 0 && (
            <Col md={4} className="mb-4">
              <Card
                className="border-0 rounded-lg"
                style={{
                  boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.1)",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  padding: "20px",
                }}
              >
                <h4
                  className="mb-4 text-center"
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    color: "#4e89ae",
                    borderBottom: "2px solid #e3f2fd",
                    paddingBottom: "10px",
                  }}
                >
                  Exclusive Offers
                </h4>

                <div>
                  {offers.map((offer: Offer, index: number) => (
                    <div
                      key={index}
                      className={`offer-card ${
                        selectedOffer === offer ? "selected" : ""
                      }`}
                      style={{
                        marginBottom: "15px",
                        padding: "15px",
                        border: `2px solid ${
                          selectedOffer === offer ? "#4e89ae" : "#e3f2fd"
                        }`,
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        position: "relative",
                        boxShadow:
                          selectedOffer === offer
                            ? "0px 6px 18px rgba(0, 0, 0, 0.15)"
                            : "none",
                      }}
                      onClick={() =>
                        handleOfferSelect(
                          selectedOffer === offer ? null : offer
                        )
                      }
                    >
                      {/* Custom Radio Indicator */}
                      <div
                        style={{
                          position: "absolute",
                          top: "15px",
                          right: "15px",
                          height: "20px",
                          width: "20px",
                          borderRadius: "50%",
                          border: `2px solid ${
                            selectedOffer === offer
                              ? "rgb(135 135 135)"
                              : "#e3f2fd"
                          }`,
                          backgroundColor:
                            selectedOffer === offer ? "#4e89ae" : "white",
                          transition: "all 0.3s ease",
                        }}
                      />

                      <h5
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "#1d3557",
                          marginBottom: "5px",
                          textDecoration: "none",
                        }}
                      >
                        {offer.offerName}
                      </h5>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6c757d",
                          marginBottom: "4px",
                        }}
                      >
                        Payment Method: {offer.paymentMethod}
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#2a9d8f",
                          fontWeight: "600",
                        }}
                      >
                        {offer.discountValue
                          ? `Discount: ${offer.discountValue}%`
                          : "Special Offer"}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Modal
                show={showOfferModal}
                onHide={() => setShowOfferModal(false)}
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>Offer Details</Modal.Title>
                </Modal.Header>
                {selectedOffer && (
                  <Modal.Body>
                    <h5
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1d3557",
                        marginBottom: "10px",
                      }}
                    >
                      {selectedOffer.offerName} - {selectedOffer.paymentMethod}
                    </h5>
                    <p style={{ fontSize: "14px", color: "#6c757d" }}>
                      {selectedOffer.description}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#457b9d",
                        marginTop: "20px",
                      }}
                    >
                      Validity:{" "}
                      {new Date(
                        selectedOffer.validityStart
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(selectedOffer.validityEnd).toLocaleDateString()}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#2a9d8f",
                        fontWeight: "600",
                      }}
                    >
                      {selectedOffer.discountValue
                        ? `Discount: ${selectedOffer.discountValue}%`
                        : "Special Offer"}
                    </p>
                  </Modal.Body>
                )}
              </Modal>
            </Col>
          )}

          <Col md={8}>
            <Card
              className="border-0 rounded-lg"
              style={{
                boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Card.Body>
                <Row>
                  <Col className="mb-4 text-center">
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
                        }}
                      />
                      <h4
                        style={{
                          fontWeight: "400",
                          color: "#2c3e50",
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
                      <FaTicketAlt
                        style={{ color: "#457b9d", marginRight: "8px" }}
                      />
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
                        style={{ color: "#457b9d", marginRight: "8px" }}
                      />
                      {formattedDate}
                    </p>
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col>
                    <p
                      style={{
                        fontWeight: "500",
                        color: "#1d3557",
                        fontSize: "16px",
                      }}
                    >
                      Seats:
                    </p>
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
                    <h5 style={{ fontWeight: '600', fontSize: '1.2rem', color: '#1d3557', marginBottom: '20px' }}>Price Breakdown</h5>
                    <div style={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span style={{ color: '#4a4a4a', fontSize: '16px' }}>Base Ticket Price</span>
                        <strong style={{ color: '#1d3557', fontSize: '16px' }}>Rs. {totalPrice.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span style={{ color: '#4a4a4a', fontSize: '16px' }}>Convenience Fee (10%)</span>
                        <strong style={{ color: '#1d3557', fontSize: '16px' }}>Rs. {convenienceFee.toFixed(2)}</strong>
                      </div>
                      {selectedOffer && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '15px', 
                          color: '#2a9d8f',
                          backgroundColor: 'rgba(42, 157, 143, 0.1)',
                          padding: '10px',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>Discount ({selectedOffer.discountValue}%)</span>
                          <strong style={{ fontSize: '16px' }}>- Rs. {((totalPrice * (selectedOffer.discountValue || 0)) / 100).toFixed(2)}</strong>
                        </div>
                      )}
                      <div style={{ 
                        borderTop: '2px dashed #e0e0e0', 
                        marginTop: '15px', 
                        paddingTop: '15px',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#1d3557', fontSize: '18px', fontWeight: '600' }}>Total Amount Payable</span>
                        <span style={{ 
                          color: '#e63946', 
                          fontSize: '22px', 
                          fontWeight: '700',
                          backgroundColor: 'rgba(230, 57, 70, 0.1)',
                          padding: '8px 15px',
                          borderRadius: '20px'
                        }}>
                          Rs. {finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#28a745', 
                      fontWeight: '500', 
                      marginTop: '15px',
                      textAlign: 'center'
                    }}>
                      <strong>💰 Use your wallet to pay and get 10% cashback!</strong>
                    </p>
                  </Col>
                </Row>

                {/* Proceed Button */}
                {!paymentMethod && (
                  <div className="text-center">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5 py-3"
                      onClick={() => setShowModal(true)}
                      style={{
                        background: "#4e89ae",
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

                <Modal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Select Payment Method</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {selectedPaymentMethods ? (
                      // Render modal with a specific payment method
                      <>
                        {selectedPaymentMethods === "Razorpay" && (
                          <Button
                            variant="outline-primary"
                            className="mb-3 w-100"
                            onClick={handleRazorpayPayment}
                            style={{ fontSize: "16px", padding: "12px" }}
                          >
                            Pay with Razorpay
                          </Button>
                        )}
                        {selectedPaymentMethods === "Paypal" && (
                          <Button
                            variant="outline-success"
                            className="mb-3 w-100"
                            onClick={() => handleProceed("paypal")}
                            style={{ fontSize: "16px", padding: "12px" }}
                          >
                            Pay with PayPal
                          </Button>
                        )}
                        {selectedPaymentMethods === "Wallet" && (
                          <Button
                            variant="outline-info"
                            className="w-100"
                            onClick={handleWalletPayment}
                            disabled={insufficientFunds}
                            style={{ fontSize: "16px", padding: "12px" }}
                          >
                            Pay with Wallet
                          </Button>
                        )}
                      </>
                    ) : (
                      // Render modal with all payment methods
                      <>
                        <Button
                          variant="outline-primary"
                          className="mb-3 w-100"
                          onClick={handleRazorpayPayment}
                          style={{ fontSize: "16px", padding: "12px" }}
                        >
                          Pay with Razorpay
                        </Button>
                        <Button
                          variant="outline-success"
                          className="mb-3 w-100"
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
                      </>
                    )}
                  </Modal.Body>
                </Modal>

                {paymentMethod === "paypal" && (
                  <div className="mt-3">
                    <PayPalScriptProvider
                      options={{
                        clientId:
                          "AXyOd3ZlDDoSe8nOeC_frUV-ZpEkIgzQtECddqkh91w04xHxYdsZr8LXxIzKHq0_Tnk87DQlR0UaEitm",
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
                        }}
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
                              console.error(
                                "Error capturing PayPal order:",
                                error
                              );
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
                        }}
                        onError={(error) => {
                          console.error("PayPal Buttons error:", error);
                          Swal.fire(
                            "Payment Error",
                            "An error occurred during payment. Please try again.",
                            "error"
                          );
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
};

export default BookingPage;

