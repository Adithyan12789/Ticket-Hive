import { useEffect, useState } from 'react';
import { useSendPasswordResetEmailMutation } from '../../Slices/UserApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../Components/UserComponents/Loader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './ForgetPasswordPage.css';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sendPasswordResetEmail, { isLoading }] = useSendPasswordResetEmailMutation();

  useEffect(() => {
    document.title = "Forgot Password - Ticket Hive";
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
    <div className="user-forgot-password-page">
      {isLoading && <div className="user-loader-overlay"><Loader /></div>}
      <div className="user-forgot-password-container">
        <h1 className="pb-5" style={{ fontSize: "30px" }}>
          {emailSent ? 'Check Your Email' : 'Forgot Password'}
        </h1>
        {emailSent ? (
          <p className="user-confirmation-message">
            We have sent a password reset link to <strong>{email}</strong>. Please check your email and follow the instructions to reset your password.
          </p>
        ) : (
          <form onSubmit={submitHandler}>
            <div className="user-fp-input">
              <div className="user-fp-input-wrapper">
                <span className="user-fp-input-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  className="user-forgot-input"
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button className="user-forgot-btn" type="submit">
              Send Reset Link
            </button>
          </form>
        )}

        {emailSent && (
          <div className="user-resend-message">
            <p>Didn't receive the email? <button className="user-resend-btn" onClick={() => setEmailSent(false)}>Resend</button></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
