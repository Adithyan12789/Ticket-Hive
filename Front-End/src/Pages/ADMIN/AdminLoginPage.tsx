import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminLoginMutation } from '../../Slices/AdminApiSlice';
import { setCredentials } from '../../Slices/AdminAuthSlice';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './AdminLoginPage.css'; 
import { RootState, AppDispatch } from '../../Store';


interface AdminResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  isAdmin: boolean;
}

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [login, { isLoading }] = useAdminLoginMutation();

  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (adminInfo) {
      navigate('/admin-dashboard');
    }
  }, [navigate, adminInfo]);
  

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
      
      const res: AdminResponse = await login({ email, password }).unwrap();
  
      
      console.log('Response from API:', res);
      console.log('isAdmin value:', res.isAdmin);
  
      
      if (res && res.isAdmin) {
        dispatch(setCredentials({
          ...res,
          data: undefined
        }));
        navigate('/admin-dashboard'); 
      } else {
        toast.error('You do not have admin access');
      }
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
    <div className="login-page">
      <div className="login-container">
        <h1 className="pb-5" style={{ fontSize: "30px" }}>Admin Login - Ticket Hive</h1>
        <form onSubmit={submitHandler}>
          <div className="input">
            <div className="input-wrapper">
              <span className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                className="login-input"
                type="email"
                placeholder="Admin Email Address"
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

          <button className="login-btn" type="submit">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
