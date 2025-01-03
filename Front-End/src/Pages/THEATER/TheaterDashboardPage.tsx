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

import TheaterLayout from "../../Components/TheaterComponents/TheaterLayout";
import Sidebar from "../../Components/TheaterComponents/TheaterSideBar";
import ReportModal from "../../Components/TheaterComponents/TheaterReportModal";
import { FilteredEarningsChart } from "../../Components/AdminComponents/filtered-earnings-chart";
import { useGetTheaterStatsMutation } from "../../Slices/TheaterApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";

import "./TheaterDashboardPage.css";

interface Stats {
  users: number;
  theaters: number;
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

interface Booking {
  bookingDate: string;
  movie: {
    _id: string;
    title: string;
  };
  totalPrice: number;
}

type EarningsFilter = 'all' | 'monthly' | 'yearly';

const TheaterDashboard: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const ownerId = theaterInfo?.id;
  const [getTheaterStats] = useGetTheaterStatsMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaters: 0,
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
    if (ownerId) {
      getTheaterStats(ownerId)
        .unwrap()
        .then((response: { stats: Stats; bookings: Booking[] }) => {
          const { stats, bookings } = response;

          setStats(stats);

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
          setFilteredEarningsData(earningsDataArray);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [ownerId, getTheaterStats]);

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

  const statItems = [
    { title: "Users", value: stats.users, icon: Users, color: "#4CAF50" },
    { title: "Theaters", value: stats.theaters, icon: Building2, color: "#2196F3" },
    { title: "Total Earnings", value: stats.totalEarnings.toLocaleString("en-US", {
      style: "currency",
      currency: "INR",
    }), icon: DollarSign, color: "#FFC107" },
    { title: "Bookings", value: stats.bookings, icon: Ticket, color: "#9C27B0" },
    { title: "Movies", value: stats.movies, icon: Film, color: "#FF5722" },
  ];

  return (
    <TheaterLayout theaterOwnerName="">
      <div className="theater-dashboard">
        <Sidebar />
        <main className="dashboard-content">
          <h1 className="dashboard-title">Theater Dashboard</h1>

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
    </TheaterLayout>
  );
};

export default TheaterDashboard;
