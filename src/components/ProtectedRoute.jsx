import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner.jsx';

const ProtectedRoute = ({ children, roles = null }) => {
  const location = useLocation();
  const { token, user, status } = useSelector((state) => state.auth);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-white md:bg-slate-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    // Redirect admins to admin dashboard, users to user dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If user is admin trying to access user dashboard, redirect to admin dashboard
  if (!roles?.length && user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;



