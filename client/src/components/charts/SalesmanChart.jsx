import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SalesmanChart = ({ data, users }) => {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No salesman data available.
      </div>
    );
  }

  const enriched = data.map((item) => ({
    ...item,
    name: users?.find((user) => user._id === item._id)?.name || item._id?.slice(-6),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={enriched} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-25} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
        <Bar dataKey="amount" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

SalesmanChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

SalesmanChart.defaultProps = {
  data: [],
  users: [],
};

export default SalesmanChart;


















