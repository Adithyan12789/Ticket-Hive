import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css';
import store from './Store';
import { Provider } from 'react-redux';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ForgotPassword from './Pages/ForgetPasswordPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/verifyotp" element={<RegisterPage />} />
      <Route path="/forget-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<RegisterPage />} />
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
