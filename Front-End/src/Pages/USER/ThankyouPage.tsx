import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../Components/UserComponents/Loader';
import { FaCheckCircle } from 'react-icons/fa';

const ThankYou = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Thank You - Payment Successful`;
  }, []);

  return (
    <div
      style={{
        fontFamily: '"Poppins", Arial, sans-serif',
        backgroundColor: '#f0f4f8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: '20px',
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Loader /> {/* Your custom loader component */}
          <p
            style={{
              marginTop: '20px',
              fontSize: '18px',
              color: '#7d879c',
              fontWeight: '500',
            }}
          >
            Processing your payment, please wait...
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '50px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <FaCheckCircle
            style={{
              color: '#4caf50',
              fontSize: '4.5rem',
              marginBottom: '20px',
              animation: 'popIn 0.5s ease-in-out',
            }}
          />
          <h1
            style={{
              color: '#2c3e50',
              marginBottom: '20px',
              fontWeight: '700',
              fontSize: '2rem',
            }}
          >
            Payment Successful!
          </h1>
          <p
            style={{
              color: '#576574',
              fontSize: '1.2rem',
              marginBottom: '20px',
              lineHeight: '1.6',
            }}
          >
            Thank you for your purchase. Your transaction has been successfully completed.
          </p>
          <Link
            to="/tickets"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: '#007bff',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: '0 4px 15px rgba(0, 123, 255, 0.2)',
            }}
          >
            View Tickets
          </Link>
        </div>
      )}
    </div>
  );
};

export default ThankYou;