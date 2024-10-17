import React, { useState, useEffect } from "react";
import { UsersTable } from "../../Components/AdminComponents/UserTable";
import { useGetUserDataMutation } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

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
      } catch (error) {
        let errorMessage = "Error fetching users";

        // Handle FetchBaseQueryError
        if (isFetchBaseQueryError(error)) {
          const fetchError = error as FetchBaseQueryError;
          errorMessage = getErrorMessage(fetchError);
        }
        // Handle SerializedError
        else if (isSerializedError(error)) {
          errorMessage = error.message || "Unknown error occurred.";
        }
        // Handle generic error (if any)
        else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [userDataFromApi]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {extractErrorMessage(error)}</p>;

  return (
    <AdminLayout adminName={"Adithyan"}>
      <Container>
        {/* Pass the fetched users to the table */}
        <UsersTable users={usersData} />
      </Container>
    </AdminLayout>
  );
};

// Type guard for FetchBaseQueryError
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error && "data" in error;
}

// Type guard for SerializedError
function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === "object" && error !== null && "message" in error;
}

// Function to extract error message from FetchBaseQueryError
function getErrorMessage(fetchError: FetchBaseQueryError): string {
  if (fetchError.data && typeof fetchError.data === "object" && "message" in fetchError.data) {
    return (fetchError.data as { message: string }).message;
  }
  return `Error status: ${fetchError.status}`;
}

// Function to extract error message for general error
function extractErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    return getErrorMessage(error);
  } else if (isSerializedError(error)) {
    return error.message || "Unknown error occurred.";
  } else if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred.";
}

export default AdminUser;
