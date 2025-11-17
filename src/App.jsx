import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { fetchProfile } from './store/slices/authSlice.js';
import useOnlineStatus from './hooks/useOnlineStatus.js';
import OfflineBanner from './components/OfflineBanner.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import { hydrateOfflineExpenses, syncOfflineExpenses } from './store/slices/expensesSlice.js';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const online = useOnlineStatus();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
    if (token) {
      dispatch(hydrateOfflineExpenses());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (online && token) {
      dispatch(syncOfflineExpenses());
    }
  }, [dispatch, online, token]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={
                token && user
                  ? user.role === 'admin'
                    ? '/admin'
                    : '/dashboard'
                  : '/login'
              }
              replace
            />
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <OfflineBanner online={online} />
      <InstallPrompt />
    </>
  );
};

export default App;

