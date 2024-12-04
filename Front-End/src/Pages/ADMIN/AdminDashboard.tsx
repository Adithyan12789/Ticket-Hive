import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/AdminComponents/AdminSideBar";
import ReportModal from "../../Components/AdminComponents/ReportModal";
import {
  useGetUserDataMutation,
  useGetBookingDetailsQuery,
  useGetTheaterOwnerDataMutation,
  useGetMoviesMutation,
} from "../../Slices/AdminApiSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import Loader from "../../Components/UserComponents/Loader";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { Box, Typography, Grid, Button } from "@mui/material";
import styled from "@emotion/styled";

const DashboardContainer = styled(Box)`
  display: flex;
  height: 100vh;
  background-color: #f4f7fb;
`;

const StatsCard = styled(Box)<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  padding: 20px;
  text-align: center;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 150px;
  width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const StatTitle = styled(Typography)`
  font-size: 1rem;
  color: #ffffff;
  font-weight: 600;
`;

const StatValue = styled(Typography)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
`;

interface Stats {
  users: number;
  theaterOwners: number;
  totalEarnings: number;
  bookings: number;
  movies: number;
}

interface Ticket {
  bookingDate: string;
  movieTitle: string;
  totalPrice: number;
}

interface Booking {
  ticket: Ticket;
}

interface BookingsData {
  tickets: Booking[];
}

const AdminDashboard: React.FC = () => {
  const [getUserData] = useGetUserDataMutation();
  const [getTheaterOwnersData] = useGetTheaterOwnerDataMutation();
  const [getMovies] = useGetMoviesMutation();
  const { data: bookings, isLoading, refetch } = useGetBookingDetailsQuery({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaterOwners: 0,
    totalEarnings: 0,
    bookings: 0,
    movies: 0,
  });

  const [bookingTrendsData, setBookingTrendsData] = useState<
    {
      date: string;
      count: number;
    }[]
  >([]);

  const [mostBookedMoviesData, setMostBookedMoviesData] = useState<
    {
      movie: string;
      count: number;
    }[]
  >([]);

  const [earningsData, setEarningsData] = useState<
    {
      date: string;
      earnings: number;
    }[]
  >([]);

  const cardColors = ["#ff9b61", "#86d0a1", "#82aaee", "#ff8398", "#bb72ff"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await getUserData({}).unwrap();
        const theaterOwnerResponse = await getTheaterOwnersData({}).unwrap();
        const moviesResponse = await getMovies({}).unwrap();

        refetch();

        const bookingsData: BookingsData = bookings;

        // Compute total earnings
        const totalEarnings = bookingsData?.tickets?.reduce(
          (sum, booking) => sum + (booking.ticket.totalPrice || 0),
          0
        );

        setStats({
          users: userResponse?.length || 0,
          theaterOwners: theaterOwnerResponse?.length || 0,
          bookings: bookingsData?.tickets?.length || 0,
          movies: moviesResponse?.movies?.length || 0,
          totalEarnings: totalEarnings || 0, // Add total earnings to stats
        });

        // Process Booking Trends Data
        const bookingDates =
          bookingsData?.tickets
            ?.map((ticket) => ticket.ticket.bookingDate?.split("T")[0])
            .filter((date) => date !== undefined) || [];

        const uniqueDates = Array.from(new Set(bookingDates));
        const trendsData = uniqueDates.map((date) => ({
          date,
          count: bookingDates.filter((d) => d === date).length,
        }));

        setBookingTrendsData(trendsData);

        // Process Most Booked Movies Data
        const movieTitles =
          bookingsData?.tickets?.map((ticket) => ticket.ticket.movieTitle) ||
          [];
        const uniqueMovies = Array.from(new Set(movieTitles));
        const moviesData = uniqueMovies.map((movie) => ({
          movie,
          count: movieTitles.filter((title) => title === movie).length,
        }));

        setMostBookedMoviesData(moviesData);

        // Process Earnings Data for Chart
        const earningsByDate = bookingsData?.tickets?.reduce(
          (acc: Record<string, number>, booking) => {
            const date = booking?.ticket?.bookingDate?.split("T")[0];
            const earnings = booking?.ticket?.totalPrice || 0;
            if (date) {
              acc[date] = (acc[date] || 0) + earnings;
            }
            return acc;
          },
          {}
        );

        const earningsDataArray = Object.entries(earningsByDate || {}).map(
          ([date, earnings]) => ({ date, earnings })
        );

        setEarningsData(earningsDataArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getUserData, getTheaterOwnersData, getMovies, bookings, refetch]);

  if (isLoading) return <Loader />;

  return (
    <AdminLayout adminName={""}>
      <DashboardContainer>
        <Sidebar adminName={"Adithyan"} />
        <Box
          sx={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#f4f7fb",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              color: "#333",
              marginBottom: "80px",
              marginTop: "50px",
              fontWeight: 700,
            }}
          >
            Admin Dashboard
          </Typography>

          <Grid
            container
            spacing={3}
            sx={{ marginLeft: "50px", marginBottom: "30px" }}
          >
            {[
              { title: "Users", value: stats.users },
              { title: "Theater Owners", value: stats.theaterOwners },
              {
                title: "Total Earnings",
                value: stats.totalEarnings.toLocaleString("en-US", {
                  style: "currency",
                  currency: "INR",
                }),
              },
              { title: "Bookings", value: stats.bookings },
              { title: "Movies", value: stats.movies },
            ].map((stat, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4} // Ensures cards align in rows
                lg={2} // Adjusts alignment for larger screens
                display="flex"
                justifyContent="center"
                key={index}
              >
                <StatsCard bgColor={cardColors[index % cardColors.length]}>
                  <StatTitle>{stat.title}</StatTitle>
                  <StatValue>{stat.value}</StatValue>
                </StatsCard>
              </Grid>
            ))}
          </Grid>

          {/* Total Earnings Section */}
          <Box
            sx={{
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              marginBottom: "30px",
              backgroundColor: "#ffffff",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "15px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Total Earnings
            </Typography>
            {earningsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={earningsData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#ff6384"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No earnings data available</Typography>
            )}
          </Box>
          {/* Booking Trends Section */}
          <Box
            sx={{
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              marginBottom: "30px",
              backgroundColor: "#ffffff",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "15px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Booking Trends
            </Typography>
            {bookingTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={bookingTrendsData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#36a2eb"
                    fill="#36a2eb"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No booking trend data available</Typography>
            )}
          </Box>
          {/* Most Booked Movies Section */}
          <Box
            sx={{
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              marginBottom: "30px",
              backgroundColor: "#ffffff",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "15px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Most Booked Movies
            </Typography>
            {mostBookedMoviesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mostBookedMoviesData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="movie" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4bc0c0" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No data for most booked movies</Typography>
            )}
          </Box>
          {/* Generate Report Button */}
          <Box sx={{ textAlign: "center", marginTop: "50px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Generate Report
            </Button>

            <ReportModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              stats={stats}
              earningsData={earningsData}
              bookingTrendsData={bookingTrendsData}
              mostBookedMoviesData={mostBookedMoviesData}
            />
          </Box>
        </Box>
      </DashboardContainer>
    </AdminLayout>
  );
};

export default AdminDashboard;
