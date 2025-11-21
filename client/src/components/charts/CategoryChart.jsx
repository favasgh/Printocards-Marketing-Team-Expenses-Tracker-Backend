import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1d4ed8', '#f59e0b', '#16a34a', '#ec4899', '#9333ea', '#0ea5e9'];

const CategoryChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No category data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="_id" innerRadius={60} outerRadius={100} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

CategoryChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      count: PropTypes.number,
    })
  ),
};

CategoryChart.defaultProps = {
  data: [],
};

export default CategoryChart;














