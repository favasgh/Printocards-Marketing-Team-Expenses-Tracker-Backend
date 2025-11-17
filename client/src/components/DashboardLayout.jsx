import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';
import { Link } from 'react-router-dom';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { toggleSidebar, closeSidebar } from '../store/slices/uiSlice.js';
import Footer from './Footer.jsx';

const DashboardLayout = ({ title, subtitle = '', actions = null, children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [logoError, setLogoError] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex min-h-screen bg-white md:bg-slate-100">
      <aside className="hidden w-64 flex-col bg-white shadow-lg md:flex">
        <div className="border-b border-slate-200 px-6 py-5">
          {logoError ? (
            <h2 className="text-xl font-semibold text-primary">Printo Expense Tracker</h2>
          ) : (
            <div className="flex items-center justify-center">
              <img 
                src="/Logo.jpeg" 
                alt="Printo Logo" 
                className="h-20 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
          )}
          <p className="mt-2 text-base md:text-sm font-bold text-black">Sales Team Expense Tracker</p>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {user?.role === 'user' && (
            <Link to="/dashboard" className="block rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-primary/10">
              My Expenses
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="block rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-primary/10">
              Admin Dashboard
            </Link>
          )}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2 text-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => dispatch(closeSidebar())} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-200 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          {logoError ? (
            <h2 className="text-xl font-semibold text-primary">Printo Expense Tracker</h2>
          ) : (
              <div className="flex items-center justify-center">
                <img 
                  src="/Logo.jpeg" 
                  alt="Printo Logo" 
                  className="h-28 md:h-20 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
          )}
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {user?.role === 'user' && (
            <Link
              to="/dashboard"
              className="block rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-primary/10"
              onClick={() => dispatch(closeSidebar())}
            >
              My Expenses
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-primary/10"
              onClick={() => dispatch(closeSidebar())}
            >
              Admin Dashboard
            </Link>
          )}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2 text-white"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 sm:py-3.5 md:px-8 md:py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                onClick={() => dispatch(toggleSidebar())}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 md:text-xl">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm md:text-sm text-slate-500">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {actions}
              <div className="hidden flex-col text-right md:flex">
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="px-3 py-4 sm:px-4 sm:py-5 md:px-8 md:py-8 text-sm sm:text-base md:text-sm min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-150px)] md:min-h-0">
          <div className="space-y-4 sm:space-y-4 md:space-y-6">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;

