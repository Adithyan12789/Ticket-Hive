import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../Slices/UserApiSlice';
import { useVerifyOtpMutation } from '../Slices/UserApiSlice'; // Assuming you have a verify OTP mutation
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone } from '@fortawesome/free-solid-svg-icons';
import './RegisterPage.css';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>(''); // OTP state
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false); // OTP modal visibility state

  const navigate = useNavigate();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation(); // Hook for OTP verification

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string): boolean => password.length >= 6;
  const validatePhone = (phone: string): boolean => /^[0-9]{10}$/.test(phone);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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

    // Send the registration request
    try {
      await register({ name, email, password, phone: Number(phone) }).unwrap();
      toast.success('Registration successful, please verify your OTP');
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

  const handleOtpSubmit = async (): Promise<void> => {
    try {
      // Send OTP for verification
      await verifyOtp({ email, otp }).unwrap();
      toast.success('OTP verification successful');
      setShowOtpModal(false);
      navigate('/login'); // Redirect to login after successful verification
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
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="pb-5 title">Ticket Hive</h1>
        <form onSubmit={submitHandler}>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              className="signup-input modern-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              className="signup-input modern-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <FontAwesomeIcon icon={faPhone} className="input-icon" />
            <input
              className="signup-input modern-input"
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              className="signup-input modern-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              className="signup-input modern-input"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="modern-btn signup-btn" type="submit">
            {isRegistering ? 'Signing Up...' : 'Sign Up'}
          </button>
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
              <button className="modern-btn otp-submit-btn" onClick={handleOtpSubmit}>
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





