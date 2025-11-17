import PropTypes from 'prop-types';

const COLORS = {
  Pending: 'bg-warning/20 text-warning',
  Approved: 'bg-success/20 text-success',
  Rejected: 'bg-danger/20 text-danger',
  Paid: 'bg-indigo-100 text-indigo-700',
};

const StatusBadge = ({ status }) => {
  const color = COLORS[status] || 'bg-slate-200 text-slate-600';
  return <span className={`badge ${color}`}>{status}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;



