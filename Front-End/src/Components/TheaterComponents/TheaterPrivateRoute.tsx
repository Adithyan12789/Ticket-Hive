import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import { useGetTheaterOwnerProfileQuery } from '../../Slices/TheaterApiSlice';
import { logout } from '../../Slices/AuthSlice';

const TheaterPrivateRoute: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const dispatch = useDispatch();

  const theaterOwnerId = theaterInfo?.id;
  const { error } = useGetTheaterOwnerProfileQuery(theaterOwnerId);

  useEffect(() => {
    if (error) {
      if ('status' in error) {
        if (error.status === 401) {
          dispatch(logout());
        }
      }
    }
  }, [error, dispatch]);

  return theaterInfo ? <Outlet /> : <Navigate to='/theater-login' replace />;
};

export default TheaterPrivateRoute;
