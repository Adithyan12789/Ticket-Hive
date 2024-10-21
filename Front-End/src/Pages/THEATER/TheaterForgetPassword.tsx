import { useEffect, useState } from 'react';
import { useSendPasswordResetEmailTheaterMutation } from '../../Slices/TheaterApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../Components/UserComponents/Loader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './TheaterForgotPassword.css';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sendPasswordResetEmailTheater, { isLoading }] = useSendPasswordResetEmailTheaterMutation();

  useEffect(() => {
    document.title = "Theater Forgot Password - Ticket Hive";
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    if (email.trim() === '') {
      toast.error('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      await sendPasswordResetEmailTheater({ email }).unwrap();
      toast.success('Password reset email sent successfully');
      setEmailSent(true); 
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    }
  };

  return (
    <div className="theater-forgot-password-page">
      {isLoading && <div className="theater-loader-overlay"><Loader /></div>}
      <div className="theater-forgot-password-container">
        <h1 className="pb-5" style={{ fontSize: "25px" }}>
          {emailSent ? 'Check Your Email' : 'Theater - Forgot Password'}
        </h1>
        {emailSent ? (
          <p className="theater-confirmation-message">
            We have sent a password reset link to <strong>{email}</strong>. Please check your email and follow the instructions to reset your password.
          </p>
        ) : (
          <form onSubmit={submitHandler}>
            <div className="theater-fp-input">
              <div className="theater-fp-input-wrapper">
                <span className="theater-fp-input-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  className="theater-forgot-input"
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button className="theater-forgot-btn" type="submit">
              Send Reset Link
            </button>
          </form>
        )}

        {emailSent && (
          <div className="theater-resend-message">
            <p>Didn't receive the email? <button className="theater-resend-btn" onClick={() => setEmailSent(false)}>Resend</button></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
