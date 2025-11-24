import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Footer from '../components/Footer.jsx';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [logoError, setLogoError] = useState(false);

  // Redirect after successful registration
  useEffect(() => {
    if (token && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser(form));
  };

  if (token && user) {
    return null; // Redirect will be handled by useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/30 px-4">
        <div className="glass-card w-full max-w-md px-6 py-10 md:px-8 md:py-10">
        <div className="flex flex-col items-center justify-center mb-4">
          {logoError ? (
            <h1 className="text-2xl font-semibold text-slate-800">Create your Printo account</h1>
          ) : (
            <img 
              src="/Logo.jpeg" 
              alt="Printo Logo" 
              className="h-24 md:h-16 w-auto object-contain mb-4"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500 text-center">Join the field team to submit expenses on the go.</p>

        {error && status === 'failed' && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1">
            <label className="text-lg md:text-sm font-medium text-slate-600" htmlFor="name">
              Full Name
            </label>
            <input id="name" name="name" className="input-field" value={form.name} onChange={handleChange} required />
          </div>
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
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
            {status === 'loading' ? <LoadingSpinner /> : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login here
          </Link>
        </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;



