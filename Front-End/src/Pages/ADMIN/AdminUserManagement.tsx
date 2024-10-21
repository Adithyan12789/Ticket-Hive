import React, { useState, useEffect } from "react";
import UserTable from "../../Components/AdminComponents/UserTable";
import { useGetUserDataMutation } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";
import { User } from "../../Types";

const AdminUser: React.FC = () => {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [refetch, setRefetch] = useState(false);

  const [userDataFromApi, { isLoading, isError, error }] = useGetUserDataMutation();

  const refetchData = () => {
    setRefetch((prev) => !prev);
  };

  useEffect(() => {
    document.title = "Users List";

    const fetchData = async () => {
      try {
        const responseFromApiCall = await userDataFromApi({}).unwrap();
        console.log("Full API res: ", responseFromApiCall);
        setUsersData(responseFromApiCall);
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
  }, [refetch, userDataFromApi]);

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
        <UserTable users={usersData} refetchData={refetchData} />
      </Container>
    </AdminLayout>
  );
};

export default AdminUser;
