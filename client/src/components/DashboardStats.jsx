import PropTypes from 'prop-types';

const DashboardStats = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3 md:gap-4">
    {stats.map((stat) => (
      <div key={stat.label} className="glass-card p-3 sm:p-4 md:p-5 lg:p-4">
        <p className="text-xs sm:text-sm md:text-base lg:text-sm font-medium text-slate-500">{stat.label}</p>
        <p className="mt-2 sm:mt-2 text-xl sm:text-2xl md:text-2xl lg:text-xl font-semibold text-slate-800 break-words">{stat.value}</p>
        {stat.subtext && <p className="mt-1 sm:mt-1 text-xs sm:text-xs md:text-xs text-slate-500">{stat.subtext}</p>}
      </div>
    ))}
  </div>
);

DashboardStats.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      subtext: PropTypes.string,
    })
  ).isRequired,
};

export default DashboardStats;



