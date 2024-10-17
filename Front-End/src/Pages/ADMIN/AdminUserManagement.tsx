import React, { useState, useEffect } from "react";
import { UsersTable } from "../../Components/AdminComponents/UserTable";
import { useGetUserDataMutation } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  otp: string;
}

const AdminUser: React.FC = () => {
  const [usersData, setUsersData] = useState<User[]>([]);

  const [userDataFromApi, { isLoading, isError, error }] = useGetUserDataMutation();

  useEffect(() => {
    document.title = "Users List";

    const fetchData = async () => {
      try {
        const responseFromApiCall = await userDataFromApi({}).unwrap();
        console.log("Full API response: ", responseFromApiCall);

        // If the API response is an array of users
        if (Array.isArray(responseFromApiCall)) {
          setUsersData(responseFromApiCall);
        } else {
          toast.warning("No users found.");
          setUsersData([]);
        }
      } catch (err: unknown) {
        let errorMessage = "Error fetching users";

        // Handle FetchBaseQueryError
        if (err && typeof err === "object" && "status" in err && "data" in err) {
          const fetchError = err as { status: number; data: unknown };
          if (fetchError.data && typeof fetchError.data === "object" && "message" in fetchError.data) {
            errorMessage = (fetchError.data as { message: string }).message;
          } else {
            errorMessage = `Error status: ${fetchError.status}`;
          }
        }
        // Handle SerializedError
        else if (err && typeof err === "object" && "message" in err) {
          errorMessage = (err as { message: string }).message;
        }

        toast.error(errorMessage);
        console.error("Error fetching users:", err);
      }
    };

    fetchData();
  }, [userDataFromApi]);

  if (isLoading) return <p>Loading...</p>; // You could replace this with a spinner for better UX
  if (isError) return <p>Error: {error instanceof Error ? error.message : "An unknown error occurred"}</p>;

  return (
    <AdminLayout adminName={"Adithyan"}>
      <Container>
        <UsersTable users={usersData} />
      </Container>
    </AdminLayout>
  );
};

export default AdminUser;
