import PropTypes from 'prop-types';

const formatCurrency = (value) => `₹${value.toFixed(2)}`;

const SalesmanSummaryTable = ({ items, status, onViewAll, onViewDashboard }) => {
  if (status === 'loading') {
    return <div className="glass-card p-6 text-center text-sm text-slate-500">Loading salesman summary...</div>;
  }

  if (!items.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-slate-500">
        No salesman data available yet. Once expenses are submitted, they will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Salesman</th>
            <th className="px-4 py-3">Pending</th>
            <th className="px-4 py-3">Paid</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {items.map((row) => (
            <tr key={row.salesmanId || row.email} className="hover:bg-slate-50/80">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">{row.name}</p>
                <p className="text-xs text-slate-500">{row.email || '—'}</p>
              </td>
              <td className="px-4 py-3 font-semibold text-amber-600">{formatCurrency(row.pendingAmount)}</td>
              <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(row.paidAmount)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-xs sm:text-sm"
                  onClick={() => onViewAll(row.salesmanId)}
                >
                  View All
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-right">
        <button type="button" className="btn-secondary text-sm" onClick={onViewDashboard}>
          View Combined Dashboard
        </button>
      </div>
    </div>
  );
};

SalesmanSummaryTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      salesmanId: PropTypes.string,
      name: PropTypes.string.isRequired,
      email: PropTypes.string,
      pendingAmount: PropTypes.number.isRequired,
      paidAmount: PropTypes.number.isRequired,
    })
  ).isRequired,
  status: PropTypes.string.isRequired,
  onViewAll: PropTypes.func.isRequired,
  onViewDashboard: PropTypes.func.isRequired,
};

export default SalesmanSummaryTable;

