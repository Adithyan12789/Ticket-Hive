import { useEffect, useState } from 'react';
import { useSendPasswordResetEmailTheaterMutation } from '../../Slices/TheaterApiSlice'; 
import { toast } from 'react-toastify';
import Loader from "../../Components/Loader"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './TheaterForgotPassword.css'; 

const TheaterOwnerForgetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false); 
  const [sendPasswordResetEmail, { isLoading }] = useSendPasswordResetEmailTheaterMutation(); 

  useEffect(() => {
    document.title = "Theater Owner Forgot Password - Ticket Hive";
  }, []);

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail({ email }).unwrap();
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
    <div className="forgot-password-page">
      {isLoading && <div className="loader-overlay"><Loader /></div>} 
      <div className="forgot-password-container">
        <h1 className="pb-5" style={{ fontSize: "25px" }}>
          {emailSent ? 'Check Your Email' : 'Theater Forgot Password'}
        </h1>
        {emailSent ? (
          <p className="confirmation-message">
            We have sent a password reset link to <strong>{email}</strong>. Please check your email and follow the instructions to reset your password.
          </p>
        ) : (
          <form onSubmit={submitHandler}>
            <div className="fp-input">
              <div className="fp-input-wrapper">
                <span className="fp-input-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  className="forgot-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="forgot-btn" type="submit">
              Send Reset Link
            </button>
          </form>
        )}

        {emailSent && (
          <div className="resend-message">
            <p>Didn't receive the email? <button className="resend-btn" onClick={() => setEmailSent(false)}>Resend</button></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterOwnerForgetPasswordPage;
