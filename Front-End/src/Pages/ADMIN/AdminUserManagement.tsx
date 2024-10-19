import React, { useState, useEffect } from "react";
import UserTable from "../../Components/AdminComponents/UserTable";
import { useGetUserDataMutation } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../Components/Loader";
import SearchBar from "../../Components/SearchBar"; // Import the Ant Design SearchBar component

interface User {
  _id: string;
  name: string;
  email: string;
  phone: number;
}

const AdminUser: React.FC = () => {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [userDataFromApi, { isLoading, isError, error }] = useGetUserDataMutation();

  useEffect(() => {
    document.title = "Users List";

    const fetchData = async () => {
      try {
        const responseFromApiCall = await userDataFromApi({}).unwrap();
        console.log("Full API response: ", responseFromApiCall);

        if (Array.isArray(responseFromApiCall)) {
          setUsersData(responseFromApiCall);
        } else {
          toast.warning("No users found.");
          setUsersData([]);
        }
      } catch (err: unknown) {
        let errorMessage = "Error fetching users";

        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          "data" in err
        ) {
          const fetchError = err as { status: number; data: unknown };
          if (
            fetchError.data &&
            typeof fetchError.data === "object" &&
            "message" in fetchError.data
          ) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = `Error status: ${fetchError.status}`;
          }
        } else if (err && typeof err === "object" && "message" in err) {
          errorMessage = (err as { message: string }).message;
        }

        toast.error(errorMessage);
        console.error("Error fetching users:", err);
      }
    };

    fetchData();
  }, [userDataFromApi]);

  // Filter the users based on search term
  const filteredUsers = usersData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="text-center">
        <p className="text-danger">
          Error:{" "}
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <AdminLayout adminName={"Adithyan"}>
      <Container>
        <Row className="align-items-center mb-4 mt-5">
          <Col md={6}>
            <h2 className="admin-userManagement-title">User Management</h2>
          </Col>
          <Col md={6} className="text-md-right text-center">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </Col>
        </Row>
        <UserTable users={filteredUsers} />
      </Container>
    </AdminLayout>
  );
};

export default AdminUser;
