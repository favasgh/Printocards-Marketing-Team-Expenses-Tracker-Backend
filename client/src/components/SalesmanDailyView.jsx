import PropTypes from 'prop-types';
import AdminExpenseTable from './AdminExpenseTable.jsx';

const SummaryCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

const SalesmanDailyView = ({
  date,
  summary,
  salesmen,
  status,
  onDateChange,
  onRefresh,
  onApproveAll,
  onRejectAll,
  bulkLoading,
  onUpdateStatus,
}) => {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const pendingCount = salesmen.reduce(
    (count, group) => count + (group.summary?.pending || 0),
    0
  );

  return (
    <section className="space-y-4">
      <div className="glass-card flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected date</p>
          <p className="text-lg font-semibold text-slate-900">{formattedDate}</p>
        </div>
        <input
          type="date"
          className="input-field max-w-xs"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={onRefresh}
          disabled={status === 'loading'}
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Total Expenses" value={summary.totalExpenses} />
        <SummaryCard label="Pending" value={summary.pending} />
        <SummaryCard label="Approved" value={summary.approved} />
        <SummaryCard label="Rejected" value={summary.rejected} />
        <SummaryCard label="Paid" value={summary.paid} />
        <SummaryCard label="Total Amount" value={`₹${summary.totalAmount?.toFixed(2) || '0.00'}`} />
      </div>

      {status === 'loading' && (
        <div className="glass-card p-4 text-center text-sm text-slate-500">Loading daily expenses…</div>
      )}

      {status !== 'loading' && salesmen.length === 0 && (
        <div className="glass-card p-6 text-center text-sm text-slate-500">
          No expenses found for this date.
        </div>
      )}

      {salesmen.map((group) => (
        <div key={group.salesman._id || group.salesman.email} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">{group.salesman.name}</p>
              <p className="text-xs text-slate-500">{group.salesman.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-500">Total</p>
              <p className="text-base font-semibold text-slate-800">
                ₹{group.summary.totalAmount.toFixed(2)} ({group.summary.totalExpenses} entries)
              </p>
            </div>
          </div>
          <AdminExpenseTable
            expenses={group.expenses}
            onUpdateStatus={onUpdateStatus}
            showSalesmanColumn={false}
          />
        </div>
      ))}

      <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Bulk actions</p>
          <p className="text-xs text-slate-500">Pending expenses: {pendingCount}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={onApproveAll}
            disabled={bulkLoading || pendingCount === 0}
          >
            Approve All
          </button>
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm text-danger"
            onClick={onRejectAll}
            disabled={bulkLoading || pendingCount === 0}
          >
            Reject All
          </button>
        </div>
      </div>
    </section>
  );
};

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

SalesmanDailyView.propTypes = {
  date: PropTypes.string.isRequired,
  summary: PropTypes.shape({
    totalAmount: PropTypes.number,
    totalExpenses: PropTypes.number,
    pending: PropTypes.number,
    approved: PropTypes.number,
    rejected: PropTypes.number,
    paid: PropTypes.number,
  }).isRequired,
  salesmen: PropTypes.arrayOf(
    PropTypes.shape({
      salesman: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
      }).isRequired,
      summary: PropTypes.shape({
        totalAmount: PropTypes.number,
        totalExpenses: PropTypes.number,
        pending: PropTypes.number,
        approved: PropTypes.number,
        rejected: PropTypes.number,
        paid: PropTypes.number,
      }).isRequired,
      expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
    })
  ).isRequired,
  status: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onApproveAll: PropTypes.func.isRequired,
  onRejectAll: PropTypes.func.isRequired,
  bulkLoading: PropTypes.bool,
  onUpdateStatus: PropTypes.func.isRequired,
};

SalesmanDailyView.defaultProps = {
  bulkLoading: false,
};

export default SalesmanDailyView;

