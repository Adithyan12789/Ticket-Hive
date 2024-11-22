import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Card,
  Alert,
  Pagination,
  DropdownButton,
  Dropdown,
  Modal,
  Button,
  FormGroup,
  FormLabel,
  FormControl,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  useGetWalletDetailsQuery,
  useCreateWalletTransactionMutation,
} from "../../Slices/UserApiSlice";
import { RootState } from "../../Store";
import UserNavBar from "../../Components/UserComponents/UserNavBar";
import Loader from "../../Components/UserComponents/Loader";
import { RazorpayOptions, RazorpayPaymentObject } from "../../Global";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaCreditCard, FaPaypal } from "react-icons/fa";
import Swal from "sweetalert2";
import { loadScript } from "../../Utils/LoadScript";
import { Form, useNavigate } from "react-router-dom";

interface Transaction {
  transactionId: string;
  amount: number;
  type: "credit" | "debit";
  status: string;
  date: string;
  description: string;
}

const WalletPage: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const { data, isLoading } = useGetWalletDetailsQuery(userInfo?.id);
  const walletBalance: number = data?.balance || 0;
  const transactions: Transaction[] = data?.transactions || [];

  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [itemsPerPage] = useState(5); // Items per page
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date"); // Sort by date or amount
  const [showAddMoneyModal, setShowAddMoneyModal] = useState<boolean>(false);
  const [amountToAdd, setAmountToAdd] = useState<number>(0);

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "paypal" | "wallet" | null
  >(null);
  const [amount, setAmount] = useState<number>(0); // Amount for wallet payment

  const [createWalletTransaction] = useCreateWalletTransactionMutation();

  useEffect(() => {
    document.title = "Ticket Hive - Wallet";
  }, []);

  // Apply filtering
  const filteredTransactions =
    filterStatus === "all"
      ? transactions
      : transactions.filter(
          (transaction) => transaction.status === filterStatus
        );

  // Apply sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "amount") {
      return b.amount - a.amount; // Sort by amount (highest to lowest)
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort by date (newest to oldest)
    }
  });

  const totalTransactions = sortedTransactions.length; // Total filtered & sorted transactions
  const totalPages = Math.ceil(totalTransactions / itemsPerPage); // Total pages

  // Logic to slice the transactions based on the current page
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

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

    const razorpayApiKey = "rzp_test_Oks5Gpac00wL72"; // Replace with your Razorpay key

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
      amount: amount * 100, // Convert to paise
      currency: "INR",
      name: "TicketHive Wallet",
      description: "Add funds to your wallet",
      handler: async (response: { razorpay_payment_id: string }) => {
        Swal.fire(
          "Payment Successful",
          "Your payment has been completed.",
          "success"
        );
        await handleCreateWalletTransaction(
          "razorpay",
          response.razorpay_payment_id
        );
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

  const handleCreateWalletTransaction = async (
    method: string,
    paymentId: string
  ) => {
    try {
      const transactionData = {
        userId: userInfo?.id, // Replace with user info
        amount,
        paymentMethod: method,
        paymentStatus: "pending",
        paymentId,
      };

      await createWalletTransaction(transactionData).unwrap();
      Swal.fire(
        "Transaction Successful",
        "Funds have been added to your wallet.",
        "success"
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        // If error is an instance of the built-in Error class
        Swal.fire(
          "Transaction Failed",
          `There was an error processing your transaction: ${error.message}`,
          "error"
        );
      } else {
        // Handle non-Error cases (e.g., network error)
        Swal.fire("Transaction Failed", "An unknown error occurred", "error");
      }
    }
  };

  const handleProceed = (method: "razorpay" | "paypal" | "wallet") => {
    setPaymentMethod(method);
    setShowModal(false);
  };

  if (isLoading) return <Loader />;

  // Handler for changing pages
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddMoney = () => {
    console.log("Adding money:", amountToAdd);
    setShowAddMoneyModal(false); // Close the current modal
    setShowModal(true); // Open the next modal
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        marginTop: "30px",
      }}
    >
      {/* User Navigation Bar */}
      <UserNavBar />

      {/* Main Content */}
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-4 text-center text-primary">Wallet</h3>

            {/* Wallet Balance */}
            <div className="text-center mb-4">
              <h4>Current Balance</h4>
              <h2 className="text-success">₹{walletBalance.toFixed(2)}</h2>
            </div>

            <div className="text-center mb-4">
              <Button
                variant="primary"
                onClick={() => setShowAddMoneyModal(true)}
              >
                Add Money
              </Button>
            </div>

            {/* Filters and Sort Options */}
            <div className="d-flex justify-content-between mb-3">
              {/* Filter by Status */}
              <DropdownButton
                id="dropdown-filter"
                variant="outline-secondary"
                title={`Filter by Status: ${
                  filterStatus === "all" ? "All" : filterStatus
                }`}
                onSelect={(status) => {
                  if (status) {
                    setFilterStatus(status);
                  }
                }}
              >
                <Dropdown.Item eventKey="all">All</Dropdown.Item>
                <Dropdown.Item eventKey="success">Success</Dropdown.Item>
                <Dropdown.Item eventKey="pending">Pending</Dropdown.Item>
                <Dropdown.Item eventKey="failed">Failed</Dropdown.Item>
              </DropdownButton>

              {/* Sort Options */}
              <DropdownButton
                id="dropdown-sort"
                variant="outline-secondary"
                title={`Sort by: ${sortBy === "amount" ? "Amount" : "Date"}`}
                onSelect={(sortOption) => {
                  if (sortOption) {
                    setSortBy(sortOption);
                  }
                }}
              >
                <Dropdown.Item eventKey="amount">Amount</Dropdown.Item>
                <Dropdown.Item eventKey="date">Date</Dropdown.Item>
              </DropdownButton>
            </div>

            {transactions.length === 0 ? (
              <Alert variant="info" className="text-center">
                No transactions found. Start booking tickets to earn cashback!
              </Alert>
            ) : (
              <Table
                striped
                bordered
                hover
                responsive
                className="text-center my-3 py-3"
              >
                <thead className="table-dark">
                  <tr>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction.transactionId}>
                      <td className="py-3">{transaction.transactionId}</td>
                      <td className="py-3 text-capitalize">
                        {transaction.type}
                      </td>
                      <td
                        className={`py-3 ${
                          transaction.type === "credit"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        ₹{transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            transaction.status === "success"
                              ? "bg-success"
                              : transaction.status === "failed"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {new Date(transaction.date).toLocaleString()}
                      </td>
                      <td className="py-3">{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Select Payment Method</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="d-flex justify-content-around">
                  <Button
                    variant="outline-primary"
                    onClick={handleRazorpayPayment}
                  >
                    <FaCreditCard /> Razorpay
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => handleProceed("paypal")}
                  >
                    <FaPaypal /> PayPal
                  </Button>
                </div>
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
                                value: amount.toString(),
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

                          if (
                            details.purchase_units &&
                            details.purchase_units[0].amount?.value
                          ) {
                            const amountValue = parseFloat(
                              details.purchase_units[0].amount.value
                            );

                            if (!isNaN(amountValue)) {
                              setAmount(amountValue);
                            } else {
                              console.error(
                                "Invalid amount value:",
                                details.purchase_units[0].amount.value
                              );
                            }
                          } else {
                            console.error(
                              "Purchase units or amount is undefined"
                            );
                          }

                          console.log("PayPal Payment Details:", details);

                          Swal.fire(
                            "Payment Successful",
                            "Your PayPal payment has been completed.",
                            "success"
                          );

                          const paymentId = details.id;

                          if (paymentId) {
                            await handleCreateWalletTransaction(
                              "paypal",
                              paymentId
                            );
                          } else {
                            console.error("Payment ID is undefined.");
                          }

                          navigate("/wallet");
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

            {/* Pagination */}
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages).keys()].map((pageNumber) => (
                <Pagination.Item
                  key={pageNumber + 1}
                  active={pageNumber + 1 === currentPage}
                  onClick={() => handlePageChange(pageNumber + 1)}
                >
                  {pageNumber + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Body>
        </Card>
      </Container>

      <Modal
        show={showAddMoneyModal}
        onHide={() => setShowAddMoneyModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Money to Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FormGroup controlId="amountToAdd">
              <FormLabel>Amount to Add</FormLabel>
              <FormControl
                type="number"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(Number(e.target.value))}
                placeholder="Enter amount"
                min="1"
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddMoneyModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleAddMoney}>
            Proceed
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WalletPage;
