import PropTypes from 'prop-types';

const DashboardStats = ({ stats }) => (
  <div className="grid gap-4 sm:gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
    {stats.map((stat) => (
      <div key={stat.label} className="glass-card p-5 sm:p-5 md:p-5 lg:p-4">
        <p className="text-2xl sm:text-lg md:text-base lg:text-sm font-medium text-slate-500">{stat.label}</p>
        <p className="mt-3 sm:mt-2 text-5xl sm:text-3xl md:text-2xl lg:text-xl font-semibold text-slate-800">{stat.value}</p>
        {stat.subtext && <p className="mt-2 sm:mt-1 text-base sm:text-sm md:text-xs text-slate-500">{stat.subtext}</p>}
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



