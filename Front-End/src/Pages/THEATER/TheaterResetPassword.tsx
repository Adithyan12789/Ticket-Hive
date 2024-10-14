import { useEffect, useState } from 'react';
import { useResetPasswordTheaterMutation } from '../../Slices/TheaterApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../Components/Loader"; 
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import './TheaterResetPassword.css'; 

const TheaterOwnerResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordTheaterMutation();

  useEffect(() => {
    document.title = "Reset Password - Ticket Hive"; 
  }, []);

  const submitHandler = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }


    if (password.length < 8 ||
        !/[a-zA-Z]/.test(password) ||
        !/\d/.test(password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must contain at least one letter, one number, one special character and must be at least 8 characters.');
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      toast.success('Password reset successfully');
      navigate('/theater-login'); 
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
    <div className="reset-password-page">
      {isLoading && <div className="loader-overlay"><Loader /></div>} 
      <div className="reset-password-container">
        <h1 className="pb-5" style={{ fontSize: "30px" }}>
          Reset Your Password
        </h1>

        <form onSubmit={submitHandler}>
          <div className="reset-input">
            <div className="reset-input-wrapper">
              <span className="reset-input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                className="reset-password-input"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="reset-input">
            <div className="reset-input-wrapper">
              <span className="reset-input-icon">
                <FontAwesomeIcon icon={faUnlockAlt} /> 
              </span>
              <input
                className="reset-password-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="reset-btn" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default TheaterOwnerResetPasswordScreen;
