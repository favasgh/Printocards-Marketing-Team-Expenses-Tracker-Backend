import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const TimelineChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No timeline data available.
      </div>
    );
  }

  const formatted = data.map((item) => ({
    ...item,
    date: format(new Date(item._id), 'dd MMM yy'),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
        <Area type="monotone" dataKey="amount" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorAmount)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

TimelineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ),
};

TimelineChart.defaultProps = {
  data: [],
};

export default TimelineChart;

















