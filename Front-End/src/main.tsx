import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import { Provider } from 'react-redux';
import store from './Store';

import { AdminRoutes, AdminLoginRoute } from './Routes/AdminRoutes';
import { UserRoutes } from './Routes/UserRoutes';
import { TheaterRoutes } from './Routes/TheaterRoutes';
// import AuthProvider from './Components/UserComponents/AuthProvider';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Admin Routes */}
      {AdminRoutes}
      {AdminLoginRoute}

      {/* User Routes */}
      {UserRoutes}

      {/* Theater Owner Routes */}
      {TheaterRoutes}
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
