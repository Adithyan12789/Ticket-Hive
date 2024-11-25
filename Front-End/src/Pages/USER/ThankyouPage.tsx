import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../Components/UserComponents/Loader';
import { FaCheckCircle } from 'react-icons/fa'; // Import FontAwesome icons

const ThankYou = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Thankyou Page`
  }, []);

  return (
    <div
      style={{
        fontFamily: '"Roboto", Arial, sans-serif',
        backgroundColor: '#f4f7fc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
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
              color: '#555',
              fontWeight: '500',
            }}
          >
            <i className="fa fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
            Please wait while we process your payment...
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff, #eef2f7)',
            padding: '40px 50px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <FaCheckCircle
            style={{
              color: '#27ae60',
              fontSize: '4rem',
              marginBottom: '20px',
            }}
          />
          <h1
            style={{
              color: '#34495e',
              marginBottom: '20px',
              fontWeight: '600',
            }}
          >
            Payment Successful!
          </h1>
          <p
            style={{
              color: '#7f8c8d',
              fontSize: '1.2rem',
              marginBottom: '20px',
              lineHeight: '1.5',
            }}
          >
            Your transaction has been processed successfully.
          </p>
          <p
            style={{
              color: '#2c3e50',
              fontSize: '1rem',
              marginBottom: '30px',
              lineHeight: '1.5',
            }}
          >
            Thank you for your purchase. We look forward to serving you again!
          </p>
          <Link
            to="/tickets"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s',
              boxShadow: '0 4px 10px rgba(41, 128, 185, 0.3)',
            }}
          >
            <i className="fa fa-ticket" style={{ marginRight: '10px' }}></i>
            View Tickets
          </Link>
        </div>
      )}
    </div>
  );
};

export default ThankYou;
