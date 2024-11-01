import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLoginTheaterMutation, useLoginTheaterMutation } from '../../Slices/TheaterApiSlice';
import { setTheaterDetails } from '../../Slices/TheaterAuthSlice';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './TheaterLoginPage.css';
import { RootState, AppDispatch } from '../../Store';
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from '@react-oauth/google';
import { GoogleJwtPayload } from '../../Types/TheaterTypes';

const TheaterLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useLoginTheaterMutation();
  const [googleLoginTheater] = useGoogleLoginTheaterMutation();

  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);

  useEffect(() => {
    if (theaterInfo) {
      navigate('/theater');
    }
  }, [navigate, theaterInfo]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
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
  
    if (password.trim() === '') {
      toast.error('Password is required');
      return;
    }
  
    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
  
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setTheaterDetails({
        ...res,
        location: '',
        capacity: 0,
        data: undefined
      }));
      navigate('/theater');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'An error occurred');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google login failed. No credential received.");
      return;
    }
  
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      if (!decoded.email || !decoded.name) {
        throw new Error("Invalid token payload");
      }
      
      const { name: googleName, email: googleEmail } = decoded;
  
      const responseFromApiCall = await googleLoginTheater({ googleName, googleEmail }).unwrap();
      dispatch(setTheaterDetails({ ...responseFromApiCall }));
      navigate("/theater");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during Google login"
      );
    }
  };

  return (
    <div className="theater-login-page">
      <div className="theater-login-container">
        <h1 className="pb-5" style={{ fontSize: "25px" }}>Ticket Hive - Theater Owner</h1>
        <form onSubmit={submitHandler}>
          <div className="theater-input">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="theater-login-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="theater-input pb-3">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="theater-login-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
  
          <div className="theater-forgot-password">
            <a href="/theater-forgot-password" className="theater-forgot-password-link">
              Forgot Password?
            </a>
          </div>
  
          <button className="theater-login-btn" type="submit">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
  
          <div className="theater-login-now pt-5">
            <p>Already a User? <a href="/theater-signup">Sign Up</a></p>
          </div>
        </form>

        <div
          className="text-center my-4"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <GoogleOAuthProvider clientId="677515594917-egtbr0hasoe3pf9j7npt2sk1s3v0e5e2.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed.")}
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
};

export default TheaterLoginPage;
