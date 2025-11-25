import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Footer from '../components/Footer.jsx';
import { logger } from '../utils/logger.js';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, status } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [logoError, setLogoError] = useState(false);

  // Redirect immediately after successful login - use requestAnimationFrame for smooth transition
  useEffect(() => {
    if (token && user && status === 'succeeded') {
      // Use requestAnimationFrame to ensure redirect happens in next frame
      requestAnimationFrame(() => {
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          // Redirect based on role
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      });
    }
  }, [token, user, status, navigate, location]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser(form));
  };

  // Show loading screen during redirect to prevent flash
  if (token && user && status === 'succeeded') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/30">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/30 px-4">
        <div className="glass-card w-full max-w-md px-6 py-10 md:px-8 md:py-10">
        <div className="flex flex-col items-center justify-center mb-4">
          {logoError ? (
            <h1 className="text-2xl font-semibold text-slate-800">Printo Field Expense Tracker</h1>
          ) : (
            <img 
              src="/Logo.jpeg" 
              alt="Printo Logo" 
              className="h-16 sm:h-20 md:h-16 w-auto object-contain mb-4"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-2xl font-bold text-center text-slate-800">Sales Team Expense Tracker</h1>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm sm:text-base md:text-sm font-medium text-slate-600" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm sm:text-base md:text-sm font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary w-full" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                <span>Logging in...</span>
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register now
          </Link>
        </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;



