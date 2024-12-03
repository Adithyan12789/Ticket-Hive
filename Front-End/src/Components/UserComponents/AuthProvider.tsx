/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useRefreshTokenMutation } from "../../Slices/UserApiSlice";
import { logout } from '../../Slices/AuthSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("Entered Auth Provider");

  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();
  const isInterceptorSetup = React.useRef(false);

  React.useEffect(() => {
    if (isInterceptorSetup.current) {
      console.log("Axios interceptor already set up");
      return;
    }
    isInterceptorSetup.current = true;

    console.log("Setting up Axios interceptor");
    const interceptor = async (error: any) => {
      if (error.response?.status === 401) {
        try {
          await refreshToken().unwrap();
          console.log("Access token refreshed");
          return Promise.resolve(); // Retry the failed request if needed
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
          dispatch(logout());
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    };

    const id = axios.interceptors.response.use(
      (response) => response,
      interceptor
    );

    return () => {
      console.log("Removing Axios interceptor", id);
      axios.interceptors.response.eject(id);
      isInterceptorSetup.current = false;
    };
  }, [dispatch, refreshToken]);

  return <>{children}</>;
};

export default AuthProvider;
