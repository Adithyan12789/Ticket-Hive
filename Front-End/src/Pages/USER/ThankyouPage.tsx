import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../Components/UserComponents/Loader';

const ThankYou = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f4f4f4',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      margin: 0,
    }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Loader /> {/* Your custom loader component */}
          <p style={{
            marginTop: '20px',
            fontSize: '18px',
            color: '#555',
          }}>
            Processing your payment...
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#fff',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          borderRadius: '15px',
          animation: 'fadeIn 0.5s ease-in-out',
        }}>
          <h1 style={{
            color: '#4CAF50',
            fontSize: '2.5rem',
            marginBottom: '10px',
          }}>
            🎉 Thank You!
          </h1>
          <p style={{
            color: '#555',
            fontSize: '1.2rem',
            marginBottom: '20px',
          }}>
            Your payment was successful.
          </p>
          <p style={{
            color: '#333',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '30px',
          }}>
            Booking ID: <span id="bookingId" style={{ color: '#4CAF50' }}>#123456</span>
          </p>
          <Link to="/" style={{
            display: 'inline-block',
            padding: '12px 25px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}>
            Go to Home
          </Link>
        </div>
      )}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default ThankYou;
