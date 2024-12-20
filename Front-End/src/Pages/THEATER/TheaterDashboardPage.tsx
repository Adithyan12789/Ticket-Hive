import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/TheaterComponents/TheaterSideBar";
import ReportModal from "../../Components/TheaterComponents/TheaterReportModal";
import { useGetTheaterStatsMutation } from "../../Slices/TheaterApiSlice";
import { FilteredEarningsChart } from "../../Components/AdminComponents/filtered-earnings-chart";
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
import TheaterLayout from "../../Components/TheaterComponents/TheaterLayout";
import { Box, Typography, Grid, Button } from "@mui/material";
import styled from "@emotion/styled";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";

// Styled components
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
  &:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
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

// interface Ticket {
//   bookingDate: string;
//   movieTitle: string;
//   totalPrice: number;
// }

interface Booking {
  bookingDate: string;
  movie: {
    _id: string;
    title: string;
  };
  totalPrice: number;
}

interface Stats {
  users: number; // Changed from theaterOwners to theaters
  theaters: number; // Changed from theaterOwners to theaters
  totalEarnings: number;
  bookings: number;
  movies: number;
}

interface TheaterStatsResponse {
  stats: Stats;
  bookings: Booking[];
}

const TheaterDashboard: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const ownerId = theaterInfo?.id;
  const [getTheaterStats] = useGetTheaterStatsMutation();
  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaters: 0,
    totalEarnings: 0,
    bookings: 0,
    movies: 0,
  });
  const [bookingTrendsData, setBookingTrendsData] = useState<
    { date: string; count: number }[]
  >([]);
  const [mostBookedMoviesData, setMostBookedMoviesData] = useState<
    { movie: string; count: number }[]
  >([]);
  const [earningsData, setEarningsData] = useState<
    { date: string; earnings: number }[]
  >([]);

  const [filteredEarningsData, setFilteredEarningsData] = useState<
    {
      date: string;
      earnings: number;
    }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [earningsFilter, setEarningsFilter] = useState<
    "all" | "monthly" | "yearly"
  >("all");

  console.log("mostBookedMoviesData: ", mostBookedMoviesData);

  useEffect(() => {
    if (ownerId) {
      getTheaterStats(ownerId)
        .unwrap()
        .then((response: TheaterStatsResponse) => {
          const { stats, bookings } = response;

          setStats(stats);

          console.log("bookings: ", bookings);

          // Extract booking dates and calculate trends
          const bookingDates = bookings.map((b) => b.bookingDate.split("T")[0]);

          const uniqueDates = Array.from(new Set(bookingDates));
          const trendsData = uniqueDates.map((date) => ({
            date,
            count: bookingDates.filter((d) => d === date).length,
          }));
          setBookingTrendsData(trendsData);

          // Calculate most booked movies
          const movieTitles = bookings.map((b) => b.movie.title);
          const uniqueMovies = Array.from(new Set(movieTitles));
          const moviesData = uniqueMovies.map((movie) => ({
            movie,
            count: movieTitles.filter((title) => title === movie).length,
          }));
          setMostBookedMoviesData(moviesData);

          // Calculate earnings by date
          const earningsByDate = bookings.reduce((acc, booking) => {
            const date = booking.bookingDate.split("T")[0];
            const earnings = booking.totalPrice;
            acc[date] = (acc[date] || 0) + earnings;
            return acc;
          }, {} as Record<string, number>);

          const earningsDataArray = Object.entries(earningsByDate).map(
            ([date, earnings]) => ({
              date,
              earnings,
            })
          );
          setEarningsData(earningsDataArray);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [ownerId, getTheaterStats]);

  const filterEarningsData = (filter: "all" | "monthly" | "yearly") => {
    setEarningsFilter(filter);
    const currentDate = new Date();
    if (filter === "all") {
      setFilteredEarningsData(earningsData);
    } else if (filter === "monthly") {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const monthlyData = earningsData.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        );
      });
      setFilteredEarningsData(monthlyData);
    } else if (filter === "yearly") {
      const currentYear = currentDate.getFullYear();
      const yearlyData = earningsData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      });
      setFilteredEarningsData(yearlyData);
    }
  };

  return (
    <TheaterLayout theaterOwnerName={""}>
      <DashboardContainer>
        <Sidebar />
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
            Theater Dashboard
          </Typography>
          <Grid
            container
            spacing={3}
            sx={{ marginLeft: "50px", marginBottom: "30px" }}
          >
            {[
              { title: "Users", value: stats.users },
              { title: "Theaters", value: stats.theaters },
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
                md={4}
                lg={2}
                display="flex"
                justifyContent="center"
                key={index}
              >
                <StatsCard bgColor="#36a2eb">
                  <StatTitle>{stat.title}</StatTitle>
                  <StatValue>{stat.value}</StatValue>
                </StatsCard>
              </Grid>
            ))}
          </Grid>

          <FilteredEarningsChart
            data={filteredEarningsData}
            filter={earningsFilter}
            onFilterChange={(filter) => {
              setEarningsFilter(filter);
              filterEarningsData(filter);
            }}
          />

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
              sx={{ marginBottom: "15px", fontWeight: 600, color: "#333" }}
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
              sx={{ marginBottom: "15px", fontWeight: 600, color: "#333" }}
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
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No booking trends data available</Typography>
            )}
          </Box>
          {/* Movies Chart Section */}
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
              sx={{ marginBottom: "15px", fontWeight: 600, color: "#333" }}
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
                  <Bar dataKey="count" fill="#ff6384" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No data for most booked movies</Typography>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: "530px" }}
            onClick={() => setIsModalOpen(true)}
          >
            Generate Report
          </Button>

          {isModalOpen && (
            <ReportModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)} // Close the modal
              stats={stats} // Pass the correct stats object
              earningsData={earningsData}
              bookingTrendsData={bookingTrendsData}
              mostBookedMoviesData={mostBookedMoviesData}
            />
          )}
        </Box>
      </DashboardContainer>
    </TheaterLayout>
  );
};

export default TheaterDashboard;
