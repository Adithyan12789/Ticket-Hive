import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import { useGetUserProfileQuery } from '../../Slices/UserApiSlice';
import { logout } from '../../Slices/AuthSlice';

const PrivateRoute: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const userId = userInfo?.id;
  const accessToken = userInfo?.accessToken;

  console.log("Private Route - User Info:", userInfo);
  console.log("Private Route - Access Token:", accessToken);
  
  // Check for token validity
  useEffect(() => {
    if (!accessToken) {
      console.log("No access token, logging out.");
      dispatch(logout());
    }
  }, [accessToken, dispatch]);

  const { error } = useGetUserProfileQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    if (error) {
      console.log("Error fetching user profile:", error);
      if ('status' in error && error.status === 401) {
        console.log("Unauthorized - Logging out.");
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  // Redirect to login if no userInfo is available
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
