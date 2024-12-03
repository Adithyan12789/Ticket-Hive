import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/AdminComponents/AdminSideBar";
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
} from "recharts";
import Loader from "../../Components/UserComponents/Loader";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import "./AdminDashboard.css";

interface Stats {
  users: number;
  theaterOwners: number;
  bookings: number;
  movies: number;
}

interface Ticket {
  bookingDate: string;
  movieTitle: string;
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

  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaterOwners: 0,
    bookings: 0,
    movies: 0,
  });

  const [bookingTrendsData, setBookingTrendsData] = useState<
    { date: string; count: number }[]
  >([]);
  const [mostBookedMoviesData, setMostBookedMoviesData] = useState<
    { movie: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await getUserData({}).unwrap();
        const theaterOwnerResponse = await getTheaterOwnersData({}).unwrap();
        const moviesResponse = await getMovies({}).unwrap();

        refetch();

        setStats({
          users: userResponse?.length || 0,
          theaterOwners: theaterOwnerResponse?.length || 0,
          bookings: bookings?.tickets?.length || 0,
          movies: moviesResponse?.movies?.length || 0,
        });

        const bookingsData: BookingsData = bookings;

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
          bookingsData?.tickets?.map((ticket) => ticket.ticket.movieTitle) || [];
        const uniqueMovies = Array.from(new Set(movieTitles));
        const moviesData = uniqueMovies.map((movie) => ({
          movie,
          count: movieTitles.filter((title) => title === movie).length,
        }));

        setMostBookedMoviesData(moviesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getUserData, getTheaterOwnersData, getMovies, bookings, refetch]);

  if (isLoading) return <Loader />;

  return (
    <AdminLayout adminName={""}>
      <div style={{ display: "flex" }}>
        <Sidebar adminName={"Adithyan"} />
        <div style={{ flex: 1, padding: "20px", backgroundColor: "#f4f7fb" }}>
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "20px",
              textAlign: "center",
              color: "#333",
            }}
          >
            Admin Dashboard
          </h1>

          {/* Stats Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            {[
              { title: "Users", value: stats.users },
              { title: "Theater Owners", value: stats.theaterOwners },
              { title: "Bookings", value: stats.bookings },
              { title: "Movies", value: stats.movies },
            ].map((stat, index) => (
              <div
                key={index}
                className="stat-card"
                style={{
                  background: "#ffffff",
                  padding: "15px",
                  textAlign: "center",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.classList.add("hover")}
                onMouseLeave={(e) => e.currentTarget.classList.remove("hover")}
              >
                <h2
                  style={{
                    fontSize: "1.4rem",
                    marginBottom: "10px",
                    color: "#4b4b4b",
                  }}
                >
                  {stat.title}
                </h2>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Booking Trends Section */}
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              marginBottom: "30px",
            }}
          >
            <h2
              style={{
                fontSize: "1.6rem",
                marginBottom: "15px",
                color: "#333",
              }}
            >
              Booking Trends
            </h2>
            {bookingTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={bookingTrendsData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorTrends" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#36a2eb" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#36a2eb" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#36a2eb"
                    fill="url(#colorTrends)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p>No booking trend data available</p>
            )}
          </div>

          {/* Most Booked Movies Section */}
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "1.6rem",
                marginBottom: "15px",
                color: "#333",
              }}
            >
              Most Booked Movies
            </h2>
            {mostBookedMoviesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mostBookedMoviesData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="movie" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ff6384" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No movie data available</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
