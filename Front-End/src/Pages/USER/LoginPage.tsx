import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../../Slices/UserApiSlice';
import { setCredentials } from '../../Slices/AuthSlice';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './LoginPage.css';
import { RootState, AppDispatch } from '../../Store';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
  
    // Check if email is empty
    if (email.trim() === '') {
      toast.error('Email is required');
      return;
    }
  
    // Check if email format is invalid
    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
  
    // Check if password is empty
    if (password.trim() === '') {
      toast.error('Password is required');
      return;
    }
  
    // Check if password length is less than 6 characters
    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
  
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'An error occurred');
    }
  };

  return (
    <div className="user-login-page">
      <div className="user-login-container">
        <h1 className="pb-5" style={{ fontSize: "40px" }}>Ticket Hive</h1>
        <form onSubmit={submitHandler}>
          <div className="user-input">
            <div className="user-input-wrapper">
              <span className="user-input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="user-login-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="user-input pb-3">
            <div className="user-input-wrapper">
              <span className="user-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="user-login-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
  
          {/* Forgot Password Link */}
          <div className="user-forgot-password">
            <a href="/forgot-password" className="user-forgot-password-link">
              Forgot Password?
            </a>
          </div>
  
          <button className="user-login-btn" type="submit">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
  
          <div className="user-login-now pt-5">
            <p>Already a User? <a href="/signup">Sign Up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
