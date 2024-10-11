import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../Slices/UserApiSlice';
import { useVerifyOtpMutation } from '../Slices/UserApiSlice';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone } from '@fortawesome/free-solid-svg-icons';
import './RegisterPage.css';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Invalid phone number');
      return;
    }

    try {
      const response = await register({ name, email, password, phone: Number(phone) }).unwrap();
      console.log(response); // Check the response here
      toast.success('Registration successful, please verify your OTP');

      // Show OTP modal only after successful registration
      setShowOtpModal(true);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    }
  };

  const handleOtpSubmit = async () => {
    setIsVerifying(true);
    try {
      await verifyOtp({ email, otp }).unwrap();
      toast.success('OTP verification successful');
      setShowOtpModal(false);
      navigate('/login');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="pb-5" style={{ fontSize: '40px' }}>Ticket Hive</h1>
        <form onSubmit={submitHandler}>
          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                className="signup-input"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="signup-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input
                className="signup-input"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="signup-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="signup-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="signup-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <div className="social-login-buttons py-4">
            <button type="button">G</button>
          </div>
          <div className="login-now">
            <p>Already have an account? <a href="/login">Log In</a></p>
          </div>
        </form>

        {showOtpModal && (
          <div className="otp-modal">
            <div className="otp-modal-content">
              <h2 className="otp-title">OTP Verification</h2>
              <p className="otp-text">Enter the OTP sent to your phone number</p>
              <div className="otp-input-container">
                <input
                  className="otp-input modern-input"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
              <button className="modern-btn otp-submit-btn" onClick={handleOtpSubmit} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
