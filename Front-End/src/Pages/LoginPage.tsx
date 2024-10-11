import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../Slices/UserApiSlice';
import { setCredentials } from '../Slices/AuthSlice';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './LoginPage.css';
import { RootState, AppDispatch } from '../Store';

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

    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      console.log(res);
      dispatch(setCredentials({ ...res }));
      navigate('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'An error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="pb-5" style={{ fontSize: "40px" }}>Ticket Hive</h1>
        <form onSubmit={submitHandler}>
          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="login-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input pb-3">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="login-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <a href="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button className="login-btn" type="submit">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="social-login-buttons py-4">
            <button type="button">G</button>
          </div>
          <div className="login-now">
            <p>Already a User? <a href="/signup">Sign Up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
