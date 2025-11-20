import PropTypes from 'prop-types';
import { useMemo } from 'react';

const DailyExpenseSummary = ({ expenses, filters, status }) => {
  const isSingleDate = Boolean(filters.startDate && filters.endDate && filters.startDate === filters.endDate);

  const summary = useMemo(() => {
    const initial = {
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
      const statusKey = expense.status?.toLowerCase();
      if (statusKey && acc[statusKey] !== undefined) {
        acc[statusKey] += 1;
      }
      return acc;
    }, initial);
  }, [expenses]);

  if (!isSingleDate) {
    return (
      <div className="glass-card p-5 sm:p-4 md:p-4">
        <p className="text-sm text-slate-500">
          Select a single date (start = end) to view the total expenses for that day.
        </p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="glass-card p-5 sm:p-4 md:p-4">
        <p className="text-sm text-slate-500">Loading selected date summary...</p>
      </div>
    );
  }

  const formattedDate = new Date(filters.startDate).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="glass-card p-5 sm:p-4 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Daily summary</p>
          <h3 className="text-lg font-semibold text-slate-800">{formattedDate}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total amount</p>
          <p className="text-2xl font-bold text-primary">₹{summary.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <SummaryItem label="Total Expenses" value={summary.totalExpenses} />
        <SummaryItem label="Pending" value={summary.pending} />
        <SummaryItem label="Approved" value={summary.approved} />
        <SummaryItem label="Rejected" value={summary.rejected} />
        <SummaryItem label="Paid" value={summary.paid} />
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 px-4 py-3">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

DailyExpenseSummary.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number,
      status: PropTypes.string,
    })
  ).isRequired,
  filters: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  status: PropTypes.string,
};

DailyExpenseSummary.defaultProps = {
  status: 'idle',
};

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default DailyExpenseSummary;

