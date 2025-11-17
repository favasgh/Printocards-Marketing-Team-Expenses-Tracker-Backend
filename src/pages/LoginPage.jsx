import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Footer from '../components/Footer.jsx';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, status } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [logoError, setLogoError] = useState(false);

  // Redirect based on user role after login
  useEffect(() => {
    if (token && user) {
      console.log('LoginPage redirect check - user:', user);
      console.log('LoginPage redirect check - user.role:', user.role);
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Redirect based on role
        if (user.role === 'admin') {
          console.log('Redirecting to /admin');
          navigate('/admin', { replace: true });
        } else {
          console.log('Redirecting to /dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [token, user, navigate, location]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser(form));
  };

  if (token && user) {
    // Redirect will be handled by useEffect
    return null;
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
              className="h-40 md:h-24 w-auto object-contain mb-4"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        <h1 className="mt-2 text-4xl md:text-2xl font-bold text-center text-slate-800">Sales Team Expense Tracker</h1>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1">
            <label className="text-lg md:text-sm font-medium text-slate-600" htmlFor="email">
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
            <label className="text-lg md:text-sm font-medium text-slate-600" htmlFor="password">
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
          <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
            {status === 'loading' ? <LoadingSpinner /> : 'Login'}
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



