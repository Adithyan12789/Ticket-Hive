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
  const { error } = useGetUserProfileQuery(userId);

  useEffect(() => {
    if (error) {
      if ('status' in error) {
        if (error.status === 401) {
          dispatch(logout());
        }
      }
    }
  }, [error, dispatch]);

  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
