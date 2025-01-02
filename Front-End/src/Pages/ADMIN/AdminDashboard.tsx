import React, { useEffect, useState } from "react";
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
} from "recharts";
import { motion } from "framer-motion";
import { Users, Building2, DollarSign, Ticket, Film, TrendingUp, BarChart2, PieChart } from 'lucide-react';

import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import Sidebar from "../../Components/AdminComponents/AdminSideBar";
import ReportModal from "../../Components/AdminComponents/ReportModal";
import { FilteredEarningsChart } from "../../Components/AdminComponents/filtered-earnings-chart";
import Loader from "../../Components/UserComponents/Loader";
import {
  useGetUserDataMutation,
  useGetBookingDetailsQuery,
  useGetTheaterOwnerDataMutation,
  useGetMoviesMutation,
} from "../../Slices/AdminApiSlice";

import "./AdminDashboard.css";

interface Stats {
  users: number;
  theaterOwners: number;
  totalEarnings: number;
  bookings: number;
  movies: number;
}

interface BookingTrend {
  date: string;
  count: number;
}

interface MovieBooking {
  movie: string;
  count: number;
}

interface EarningsData {
  date: string;
  earnings: number;
}

interface Ticket {
  bookingDate: string;
  movieTitle: string;
  totalPrice: number;
}

interface Booking {
  ticket: Ticket;
}

type EarningsFilter = 'all' | 'monthly' | 'yearly';

const AdminDashboard: React.FC = () => {
  const [getUserData] = useGetUserDataMutation();
  const [getTheaterOwnersData] = useGetTheaterOwnerDataMutation();
  const [getMovies] = useGetMoviesMutation();
  const { data: bookings, isLoading, refetch } = useGetBookingDetailsQuery({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaterOwners: 0,
    totalEarnings: 0,
    bookings: 0,
    movies: 0,
  });
  const [bookingTrendsData, setBookingTrendsData] = useState<BookingTrend[]>([]);
  const [mostBookedMoviesData, setMostBookedMoviesData] = useState<MovieBooking[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [filteredEarningsData, setFilteredEarningsData] = useState<EarningsData[]>([]);
  const [earningsFilter, setEarningsFilter] = useState<EarningsFilter>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await getUserData({}).unwrap();
        const theaterOwnerResponse = await getTheaterOwnersData({}).unwrap();
        const moviesResponse = await getMovies({}).unwrap();
        refetch();

        const bookingsData = bookings as { tickets: Booking[] } | undefined;

        const totalEarnings = bookingsData?.tickets?.reduce(
          (sum, booking) => sum + (booking.ticket.totalPrice || 0),
          0
        ) || 0;

        setStats({
          users: userResponse?.length || 0,
          theaterOwners: theaterOwnerResponse?.length || 0,
          bookings: bookingsData?.tickets?.length || 0,
          movies: moviesResponse?.movies?.length || 0,
          totalEarnings: totalEarnings,
        });

        const bookingDates = bookingsData?.tickets
          ?.map((booking) => booking.ticket.bookingDate?.split("T")[0])
          .filter((date): date is string => date !== undefined) || [];

        const uniqueDates = Array.from(new Set(bookingDates));
        const trendsData = uniqueDates.map((date) => ({
          date,
          count: bookingDates.filter((d) => d === date).length,
        }));

        setBookingTrendsData(trendsData);

        const movieTitles = bookingsData?.tickets?.map((booking) => booking.ticket.movieTitle) || [];
        const uniqueMovies = Array.from(new Set(movieTitles));
        const moviesData = uniqueMovies.map((movie) => ({
          movie,
          count: movieTitles.filter((title) => title === movie).length,
        }));

        setMostBookedMoviesData(moviesData);

        const earningsByDate = bookingsData?.tickets?.reduce(
          (acc: Record<string, number>, booking) => {
            const date = booking.ticket.bookingDate?.split("T")[0];
            const earnings = booking.ticket.totalPrice || 0;
            if (date) {
              acc[date] = (acc[date] || 0) + earnings;
            }
            return acc;
          },
          {}
        ) || {};

        const earningsDataArray = Object.entries(earningsByDate).map(
          ([date, earnings]) => ({ date, earnings })
        );

        setEarningsData(earningsDataArray);
        setFilteredEarningsData(earningsDataArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getUserData, getTheaterOwnersData, getMovies, bookings, refetch]);

  const filterEarningsData = (filter: EarningsFilter) => {
    setEarningsFilter(filter);
    const currentDate = new Date();
    if (filter === 'all') {
      setFilteredEarningsData(earningsData);
    } else if (filter === 'monthly') {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const monthlyData = earningsData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      setFilteredEarningsData(monthlyData);
    } else if (filter === 'yearly') {
      const currentYear = currentDate.getFullYear();
      const yearlyData = earningsData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      });
      setFilteredEarningsData(yearlyData);
    }
  };

  if (isLoading) return <Loader />;

  const statItems = [
    { title: "Users", value: stats.users, icon: Users, color: "#4CAF50" },
    { title: "Theater Owners", value: stats.theaterOwners, icon: Building2, color: "#2196F3" },
    { title: "Total Earnings", value: stats.totalEarnings.toLocaleString("en-US", {
      style: "currency",
      currency: "INR",
    }), icon: DollarSign, color: "#FFC107" },
    { title: "Bookings", value: stats.bookings, icon: Ticket, color: "#9C27B0" },
    { title: "Movies", value: stats.movies, icon: Film, color: "#FF5722" },
  ];

  return (
    <AdminLayout adminName="">
      <div className="admin-dashboard">
        <Sidebar adminName="Adithyan" />
        <main className="dashboard-content">
          <h1 className="dashboard-title">Admin Dashboard</h1>

          <div className="stats-grid">
            {statItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="stat-card"
                style={{ backgroundColor: item.color, color: "#ffffff" }}
              >
                <div className="stat-icon">
                  <item.icon size={40} />
                </div>
                <h2 className="stat-title">{item.title}</h2>
                <p className="stat-value">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3 className="chart-title">
                <TrendingUp size={24} className="chart-icon" />
                Booking Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={bookingTrendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">
                <BarChart2 size={24} className="chart-icon" />
                Most Booked Movies
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mostBookedMoviesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="movie" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="earnings-chart">
            <h3 className="chart-title">
              <PieChart size={24} className="chart-icon" />
              Earnings Overview
            </h3>
            <FilteredEarningsChart
              data={filteredEarningsData}
              filter={earningsFilter}
              onFilterChange={(filter: EarningsFilter) => {
                setEarningsFilter(filter);
                filterEarningsData(filter);
              }}
            />
          </div>

          <button className="generate-report-button" onClick={() => setIsModalOpen(true)}>
            Generate Report
          </button>

          <ReportModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            stats={stats}
            earningsData={earningsData}
            bookingTrendsData={bookingTrendsData}
            mostBookedMoviesData={mostBookedMoviesData}
          />
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

