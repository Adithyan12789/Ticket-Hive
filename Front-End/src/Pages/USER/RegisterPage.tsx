import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLoginMutation, useRegisterMutation } from "../../Slices/UserApiSlice";
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "../../Slices/UserApiSlice";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../../Components/UserComponents/Loader";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from '@react-oauth/google';
import { setCredentials } from "../../Slices/AuthSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Store";
import { GoogleJwtPayload } from "../../Types/UserTypes";
import "react-toastify/dist/ReactToastify.css";


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
  
  const [register, { isLoading }] = useRegisterMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  
  const [googleLogin] = useGoogleLoginMutation();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone);
  const validateName = (name: string) => name.trim().length >= 3;

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = [];

    if (!name) errors.push("Name is required.");
    if (!email) errors.push("Email is required.");
    if (!password) errors.push("Password is required.");
    if (!confirmPassword) errors.push("Please confirm your password.");
    if (!phone) errors.push("Phone number is required.");
    if (!validateName(name)) errors.push("Please enter a valid name.");
    if (!validateEmail(email)) errors.push("Please enter a valid email address.");
    
    if (!validatePassword(password)) {
      errors.push("Password must be at least 8 characters long, contain at least one letter, one number, and one special character.");
    }
    if (password !== confirmPassword) errors.push("Passwords do not match.");
    if (!validatePhone(phone)) errors.push("Please enter a valid phone number.");
    
    if (errors.length > 0) {
        toast.error(errors.join(' '));
        return;
    }
    
    try {
      await register({
        name,
        email,
        password,
        phone: Number(phone),
      }).unwrap();

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
  
      const responseFromApiCall = await googleLogin({ googleName, googleEmail }).unwrap();
      dispatch(setCredentials({ ...responseFromApiCall }));
      
      toast.success("Google login successful!");
      navigate("/");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during Google login"
      );
    }
  };

  useEffect(() => {
    if (otpExpires) {
      const interval = setInterval(() => {
        const timeRemaining = Math.floor((otpExpires.getTime() - Date.now()) / 1000);
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
    if (!otp || !/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtp({ email, otp }).unwrap();
      toast.success("OTP verification successful");
      setShowOtpModal(false);
      navigate("/login");
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
      await resendOtp({ email }).unwrap();
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
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading || isVerifying || isResending) return <Loader />;


  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div 
        className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-sm"
        style={{backgroundImage: "url('/pngtree-old-movie-posters-on-the-wall-image_2881318.jpg')"}}
      ></div>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white shadow-2xl rounded-xl">
        <div className="flex items-center justify-center space-x-4">
          <img src="/logo.png" alt="Ticket Hive Icon" className="w-16 h-16" />
          <h1 className="text-4xl font-bold text-gray-800">Ticket Hive</h1>
        </div>
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="relative">
            <FontAwesomeIcon icon={faUser} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon icon={faPhone} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            type="submit"
            disabled={isLoading}
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <GoogleOAuthProvider clientId="677515594917-egtbr0hasoe3pf9j7npt2sk1s3v0e5e2.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed.")}
              />
            </GoogleOAuthProvider>
          </div>
        </div>

        <p className="mt-8 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-purple-600 hover:text-purple-500">
            Login Now
          </a>
        </p>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white rounded-lg">
            <h3 className="mb-4 text-2xl font-bold">OTP Verification</h3>
            <p className="mb-4">
              We have sent an OTP to your email. Please enter the OTP below to
              proceed with the verification.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md"
            />
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleOtpSubmit}
                disabled={isVerifying || timeLeft < 0}
                className="px-4 py-2 text-white transition duration-300 bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Verify OTP
              </button>
              {timeLeft <= 0 && (
                <button
                  onClick={handleOtpResend}
                  disabled={isResending}
                  className="px-4 py-2 text-gray-800 transition duration-300 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Time Left: <span className="font-bold">{formatTimeLeft()}</span>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Didn't receive the OTP? Wait until the time expires to resend.
            </p>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default SignUpPage;

