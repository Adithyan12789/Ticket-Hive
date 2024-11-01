import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLoginTheaterMutation, useRegisterTheaterMutation } from "../../Slices/TheaterApiSlice";
import {
  useVerifyOtpTheaterMutation,
  useResendOtpTheaterMutation,
} from "../../Slices/TheaterApiSlice";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import "./TheaterRegisterPage.css";
import Loader from "../../Components/UserComponents/Loader";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from '@react-oauth/google';
import { setTheaterDetails } from "../../Slices/TheaterAuthSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Store";
import { GoogleJwtPayload } from "../../Types/TheaterTypes";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpires, setOtpExpires] = useState<Date | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [registerTheater, { isLoading }] = useRegisterTheaterMutation();
  const [verifyOtpTheater] = useVerifyOtpTheaterMutation();
  const [resendOtpTheater] = useResendOtpTheaterMutation();

  const [googleLoginTheater] = useGoogleLoginTheaterMutation();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);
  const validateName = (name: string) => name.trim().length >= 3;

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (!confirmPassword) {
      toast.error("Confirm Password is required");
      return;
    }
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    if (!validateName(name)) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePhone(phone)) {
      toast.error("Invalid phone number (must be 10 digits)");
      return;
    }

    try {
      const response = await registerTheater({
        name,
        email,
        password,
        phone: Number(phone),
      }).unwrap();

      console.log(response);
      toast.success("Registration successful, please verify your OTP");

      const expiresAt = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);
      setOtpExpires(expiresAt);
      setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      setShowOtpModal(true);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
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
      
      toast.success("Google login successful!");
      navigate("/theater");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during Google login"
      );
    }
  };

  useEffect(() => {
    if (otpExpires) {
      const interval = setInterval(() => {
        const timeRemaining = Math.floor(
          (otpExpires.getTime() - Date.now()) / 1000
        );
        setTimeLeft(timeRemaining);

        if (timeRemaining <= 0) {
          clearInterval(interval);
          setOtpExpires(null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otpExpires]);

  const handleOtpSubmit = async () => {
    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtpTheater({ email, otp }).unwrap();
      toast.success("OTP verification successful");
      setShowOtpModal(false);
      navigate("/theater-login");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpResend = async () => {
    if (timeLeft > 0) {
      toast.error("You can only resend OTP after the previous one expires.");
      return;
    }
  
    setIsResending(true);
  
    try {
      await resendOtpTheater({ email }).unwrap();
      toast.success("OTP resent successfully");
  
      const expiresAt = new Date(Date.now() + 1 * 60 * 1000 + 59 * 1000);
      setOtpExpires(expiresAt);
      setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const error = err as { data?: { message?: string } };
        toast.error(error.data?.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setIsResending(false);
    }
  };
  

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if(isLoading || isVerifying || isResending) return <Loader/>

  return (
    <div className="theater-signup-page">
      <div className="theater-signup-container">
        <h1 className="pb-5" style={{ fontSize: "25px" }}>
          Ticket Hive - Theater Owner
        </h1>
        <form onSubmit={submitHandler}>
          <div className="theater-input">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                className="theater-signup-input"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="theater-input">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="theater-signup-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="theater-input">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input
                className="theater-signup-input"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="theater-input">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="theater-signup-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="theater-input">
            <div className="theater-input-wrapper">
              <span className="theater-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="theater-signup-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            className="theater-signup-btn"
            type="submit"
            disabled={isLoading}
          >
            Sign Up
          </button>

          <div className="theater-login-now pt-5">
            <p>
              Already have an account? <a href="/theater-login">Login Now</a>
            </p>
          </div>
        </form>

        <div
          className="text-center"
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

      {showOtpModal && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h3 className="otp-modal-title">OTP Verification</h3>
            <p className="otp-modal-description">
              We have sent an OTP to your email. Please enter the OTP below to
              proceed with the verification.
            </p>
            <div className="otp-input-wrapper">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="otp-input"
              />
            </div>

            <div className="otp-modal-footer">
              <button
                onClick={handleOtpSubmit}
                disabled={isVerifying || timeLeft < 0}
                className="otp-btn primary-btn"
              >
                {" "}
                Verify OTP
              </button>

              {timeLeft <= 0 && (
                <button
                  onClick={handleOtpResend}
                  disabled={isResending}
                  className="otp-btn secondary-btn"
                >
                  {" "}
                  Resend OTP
                </button>
              )}

              <p className="otp-time-left">
                Time Left: <span>{formatTimeLeft()}</span>
              </p>
            </div>
            <p className="otp-modal-note">
              Didn’t receive the OTP? wait until the time expires to resend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
