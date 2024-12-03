import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../Slices/AuthSlice";
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import "./LoginPage.css";
import { RootState, AppDispatch } from "../../Store";
import { useGoogleLoginMutation, useLoginMutation } from "../../Slices/UserApiSlice";
import { CredentialResponse } from '@react-oauth/google';
import { GoogleJwtPayload } from "../../Types/UserTypes";
import Loader from "../../Components/UserComponents/Loader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(true); 

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    // Simulate a 4-second loading delay
    const timer = setTimeout(() => {
      setLoading(false);  // After 4 seconds, set loading to false
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);
  

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (email.trim() === "") {
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (password.trim() === "") {
      toast.error("Password is required");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      console.log("res.accessToken: ", res.accessToken);
      console.log("res.refreshToken: ", res.refreshToken);
      
      dispatch(setCredentials({
        ...res,
        accessToken: res.accessToken, 
        refreshToken: res.refreshToken,
      }));
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "An error occurred");
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
  
      const responseFromApiCall = await googleLogin({ googleName, googleEmail }).unwrap();
      dispatch(setCredentials({ ...responseFromApiCall }));
      navigate("/");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during Google login"
      );
    }

    if (loading) return <Loader />;
    
  };

  return (
    <div className="user-login-page">
      <div className="user-login-container">
        <div className="header-container">
          <img
            src="/stock-vector-icon-logo-illustration-for-digital-business-ticket-services-720686734-removebg-preview.png"
            alt="Ticket Hive Icon"
            className="header-icon pb-5"
          />
          <h1 className="pb-4" style={{ fontSize: "40px" }}>
            Ticket Hive
          </h1>
        </div>
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

          <div className="user-forgot-password">
            <a href="/forgot-password" className="user-forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button className="user-login-btn" type="submit">
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="user-login-now pt-5">
            <p>
              Already a User? <a href="/signup">Sign Up</a>
            </p>
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

export default LoginPage;
