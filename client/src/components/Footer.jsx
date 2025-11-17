import PropTypes from 'prop-types';

const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-slate-200 bg-white py-3 sm:py-3.5 md:py-4 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 text-center text-lg md:text-sm text-slate-600 md:px-8 py-4 sm:py-4 md:py-4">
        <p>
          © {currentYear} Printo Cards and Technologies. All rights reserved. | Sales Team Expense Tracker
        </p>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;

