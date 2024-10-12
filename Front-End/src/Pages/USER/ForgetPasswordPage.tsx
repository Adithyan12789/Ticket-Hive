import { useEffect, useState } from 'react';
import { useSendPasswordResetEmailMutation } from '../../Slices/UserApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../Components/Loader"; // Use an overlay loader instead of a full-page loader
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './ForgetPasswordPage.css';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false); // Track if email is sent
  const [sendPasswordResetEmail, { isLoading }] = useSendPasswordResetEmailMutation();

  useEffect(() => {
    document.title = "Forgot Password - Ticket Hive";
  }, []);

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail({ email }).unwrap();
      toast.success('Password reset email sent successfully');
      setEmailSent(true); // Update state to show confirmation message
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
      {isLoading && <div className="loader-overlay"><Loader /></div>} {/* Add loader overlay */}
      <div className="forgot-password-container">
        <h1 className="pb-5" style={{ fontSize: "30px" }}>
          {emailSent ? 'Check Your Email' : 'Forgot Password'}
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

export default ForgotPasswordScreen;
