import React, { useState, useEffect } from "react";
import TheaterOwnersTable from "../../Components/AdminComponents/TheaterOwnersTable";
import { useGetTheaterOwnerDataMutation } from "../../Slices/AdminApiSlice";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../Components/UserComponents/Loader";
import { Theater } from "../../Types/TheaterTypes";

const TheaterOwners: React.FC = () => {
  const [theaterOwnersData, settheaterOwnersData] = useState<Theater[]>([]);
  const [refetch, setRefetch] = useState(false);

  const [theaterOwnersDataFromApi, { isLoading, isError, error }] = useGetTheaterOwnerDataMutation();

  const refetchData = () => {
    setRefetch((prev) => !prev);
  };

  useEffect(() => {
    document.title = "Theater Owners List";

    const fetchData = async () => {
      try {
        const responseFromApiCall = await theaterOwnersDataFromApi({}).unwrap();
        console.log("Full API res: ", responseFromApiCall);
        settheaterOwnersData(responseFromApiCall);
      } catch (err: unknown) {
        let errorMessage = "Error fetching Theater Owners";

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
        console.error("Error fetching theater owners:", err);
      }
    };

    fetchData();
  }, [refetch, theaterOwnersDataFromApi]);

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
        <TheaterOwnersTable theaterOwners={theaterOwnersData} refetchData={refetchData} />
      </Container>
    </AdminLayout>
  );
};

export default TheaterOwners;
