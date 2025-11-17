import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge.jsx';

const AdminExpenseTable = ({ expenses, onUpdateStatus }) => {
  if (!expenses.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-slate-500">
        No expenses found for the selected filters.
      </div>
    );
  }

  const handleStatusChange = (expense, status) => {
    const comment = window.prompt(`Add a comment for ${status} (optional):`, expense.adminComment || '');
    onUpdateStatus({
      id: expense._id,
      status,
      adminComment: comment || '',
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-lg sm:text-base md:text-sm lg:text-xs font-medium uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Salesman</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Receipt</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-lg sm:text-base md:text-sm lg:text-sm">
          {expenses.map((expense) => (
            <tr key={expense._id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{expense.userId?.name}</div>
                <div className="text-base md:text-xs text-slate-500">{expense.userId?.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{expense.category}</div>
                {expense.note && <div className="text-base md:text-xs text-slate-500">{expense.note}</div>}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-700">₹{expense.amount.toFixed(2)}</td>
              <td className="px-4 py-3">
                <div>{format(new Date(expense.date), 'dd MMM yyyy')}</div>
                <div className="text-base md:text-xs text-slate-500">{expense.location || '—'}</div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={expense.status} />
                {expense.adminComment && <div className="mt-1 text-base md:text-xs text-slate-500">Note: {expense.adminComment}</div>}
              </td>
              <td className="px-4 py-3">
                {expense.imageUrl ? (
                  <a href={expense.imageUrl} target="_blank" rel="noreferrer" className="text-lg md:text-sm text-primary hover:underline">
                    View receipt
                  </a>
                ) : (
                  <span className="text-base md:text-xs text-slate-400">No file</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {expense.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        className="btn-primary px-6 py-4 sm:px-5 sm:py-3 md:px-4 md:py-2 lg:px-3 lg:py-1 text-xl sm:text-lg md:text-base lg:text-xs"
                        onClick={() => handleStatusChange(expense, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-6 py-4 sm:px-5 sm:py-3 md:px-4 md:py-2 lg:px-3 lg:py-1 text-xl sm:text-lg md:text-base lg:text-xs text-danger"
                        onClick={() => handleStatusChange(expense, 'Rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {expense.status === 'Approved' && (
                    <button
                      type="button"
                      className="btn-primary px-5 py-3 md:px-3 md:py-1 text-base md:text-xs bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleStatusChange(expense, 'Paid')}
                    >
                      Paid
                    </button>
                  )}
                  {expense.status === 'Rejected' && (
                    <button
                      type="button"
                      className="btn-primary px-6 py-4 sm:px-5 sm:py-3 md:px-4 md:py-2 lg:px-3 lg:py-1 text-xl sm:text-lg md:text-base lg:text-xs"
                      onClick={() => handleStatusChange(expense, 'Approved')}
                    >
                      Approve
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
};

export default AdminExpenseTable;



