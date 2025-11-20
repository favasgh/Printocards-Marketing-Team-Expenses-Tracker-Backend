import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge.jsx';

const AdminExpenseTable = ({ expenses, onUpdateStatus, showSalesmanColumn = true }) => {
  if (!expenses.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-slate-500">
        No expenses found for the selected filters.
      </div>
    );
  }

  const handleStatusChange = (expense, status) => {
    const statusMessages = {
      'Pending': 'revert to Pending',
      'Approved': 'approve',
      'Rejected': 'reject',
      'Paid': 'mark as Paid',
    };
    const actionMessage = statusMessages[status] || status.toLowerCase();
    const comment = window.prompt(`Add a comment for ${actionMessage} (optional):`, expense.adminComment || '');
    if (comment !== null) {
      onUpdateStatus({
        id: expense._id,
        status,
        adminComment: comment || '',
      });
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs sm:text-sm md:text-sm lg:text-xs font-medium uppercase text-slate-500">
          <tr>
            {showSalesmanColumn && <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Salesman</th>}
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Category</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Amount</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Date</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Status</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">Receipt</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm md:text-sm">
          {expenses.map((expense) => (
            <tr key={expense._id} className="hover:bg-slate-50/60">
              {showSalesmanColumn && (
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                  <div className="font-medium text-slate-800 text-xs sm:text-sm">{expense.userId?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500 hidden sm:block">{expense.userId?.email || '—'}</div>
                </td>
              )}
              <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                <div className="font-medium text-slate-800 text-xs sm:text-sm">{expense.category}</div>
                {expense.note && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{expense.note}</div>}
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 font-semibold text-slate-700 text-xs sm:text-sm">₹{expense.amount.toFixed(2)}</td>
              <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                <div className="text-xs sm:text-sm">{format(new Date(expense.date), 'dd MMM yyyy')}</div>
                <div className="text-xs text-slate-500 hidden sm:block">{expense.location || '—'}</div>
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                <StatusBadge status={expense.status} />
                {expense.adminComment && <div className="mt-1 text-xs text-slate-500 line-clamp-1">Note: {expense.adminComment}</div>}
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">
                {expense.imageUrl ? (
                  <a href={expense.imageUrl} target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-primary hover:underline">
                    View
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">No file</span>
                )}
              </td>
              <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  {expense.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                        onClick={() => handleStatusChange(expense, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-danger whitespace-nowrap"
                        onClick={() => handleStatusChange(expense, 'Rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {expense.status === 'Approved' && (
                    <>
                      <button
                        type="button"
                        className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                        onClick={() => handleStatusChange(expense, 'Paid')}
                      >
                        Mark Paid
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                        onClick={() => handleStatusChange(expense, 'Pending')}
                      >
                        Undo Approval
                      </button>
                    </>
                  )}
                  {expense.status === 'Rejected' && (
                    <>
                      <button
                        type="button"
                        className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                        onClick={() => handleStatusChange(expense, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                        onClick={() => handleStatusChange(expense, 'Pending')}
                      >
                        Undo Rejection
                      </button>
                    </>
                  )}
                  {expense.status === 'Paid' && (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                      onClick={() => handleStatusChange(expense, 'Approved')}
                    >
                      Undo Paid
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

AdminExpenseTable.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      note: PropTypes.string,
      adminComment: PropTypes.string,
      location: PropTypes.string,
      imageUrl: PropTypes.string,
      userId: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
    })
  ).isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  showSalesmanColumn: PropTypes.bool,
};

AdminExpenseTable.defaultProps = {
  showSalesmanColumn: true,
};

export default AdminExpenseTable;



