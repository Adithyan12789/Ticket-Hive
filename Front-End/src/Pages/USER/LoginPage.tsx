import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../Slices/AuthSlice";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { RootState, AppDispatch } from "../../Store";
import { useGoogleLoginMutation, useLoginMutation } from "../../Slices/UserApiSlice";
import { CredentialResponse } from '@react-oauth/google';
import { GoogleJwtPayload } from "../../Types/UserTypes";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../Components/UserComponents/Loader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const { userInfo } = useSelector((state: RootState) => state.auth) || {};

  console.log("userInfo: ", userInfo);
  

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
        _id: ""
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
    
  };

  if (loading) return <Loader />;

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
          <h1 className="pt-4 text-4xl font-bold text-gray-800">Ticket Hive</h1>
        </div>
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute pt-5 text-gray-400 transform -translate-y-1/2 left-3" />
              <input
                className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute pt-5 text-gray-400 transform -translate-y-1/2 left-3" />
              <input
                className="w-full py-2 pl-10 pr-3 text-gray-700 placeholder-gray-500 border-2 border-gray-300 rounded-lg outline-none focus:border-purple-500"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 pt-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
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

          <div className="mt-6">
            <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed.")}
              />
            </GoogleOAuthProvider>
          </div>
        </div>

        <p className="mt-8 text-sm text-center text-gray-600">
          Not a member?{' '}
          <a href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up now
          </a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
