import PropTypes from 'prop-types';
import { useMemo } from 'react';

const DailyExpenseSummary = ({ expenses, filters, status }) => {
  const isSingleDate = Boolean(filters.startDate && filters.endDate && filters.startDate === filters.endDate);

  const summary = useMemo(() => {
    const base = {
      totalAmount: 0,
      totalExpenses: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
    };
    return expenses.reduce((acc, expense) => {
      const amount = Number(expense.amount) || 0;
      acc.totalAmount += amount;
      acc.totalExpenses += 1;
      const key = expense.status?.toLowerCase();
      if (key && typeof acc[key] === 'number') {
        acc[key] += 1;
      }
      return acc;
    }, base);
  }, [expenses]);

  if (!isSingleDate) {
    return (
      <div className="glass-card p-5 sm:p-4">
        <p className="text-sm text-slate-500">Pick a specific date to view totals for that day.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="glass-card p-5 sm:p-4">
        <p className="text-sm text-slate-500">Loading day summary…</p>
      </div>
    );
  }

  const formattedDate = new Date(filters.startDate).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const title =
    filters.category ||
    filters.search ||
    filters.status ||
    filters.salesman
      ? 'Filtered Expenses'
      : 'All Expenses';

  return (
    <div className="glass-card p-5 sm:p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-6 text-sm sm:text-base">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
          <p className="text-lg font-semibold text-slate-800">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Expense title</p>
          <p className="text-lg font-semibold text-slate-800">{title}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total expenses of the day</p>
          <p className="text-2xl font-bold text-primary">₹{summary.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 text-sm font-semibold">
        <span className="text-slate-600">Total: {summary.totalExpenses}</span>
        <span className="text-emerald-600">Approve: {summary.approved}</span>
        <span className="text-amber-500">Pending: {summary.pending}</span>
        <span className="text-rose-500">Reject: {summary.rejected}</span>
        <span className="text-sky-600">Paid: {summary.paid}</span>
      </div>
    </div>
  );
};

DailyExpenseSummary.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
    })
  ).isRequired,
  filters: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    category: PropTypes.string,
    search: PropTypes.string,
    status: PropTypes.string,
    salesman: PropTypes.string,
  }).isRequired,
  status: PropTypes.string,
};

DailyExpenseSummary.defaultProps = {
  status: 'idle',
};

export default DailyExpenseSummary;

