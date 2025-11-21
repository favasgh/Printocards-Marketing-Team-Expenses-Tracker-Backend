import { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge.jsx';

const AdminExpenseTable = ({ expenses, onUpdateStatus }) => {
  const groupedData = useMemo(() => {
    const salesmenMap = new Map();

    expenses.forEach((expense) => {
      const salesmanId = expense.userId?._id || expense.userId?.id || expense.userId || 'unknown';
      const current = salesmenMap.get(salesmanId) || {
        salesman: {
          id: salesmanId,
          name: expense.userId?.name || 'Unknown',
          email: expense.userId?.email || '—',
        },
        totals: {
          amount: 0,
          count: 0,
        },
        statusCount: {
          Pending: 0,
          Approved: 0,
          Rejected: 0,
          Paid: 0,
        },
        allIds: [],
        dates: {},
      };

      current.totals.amount += expense.amount;
      current.totals.count += 1;
      current.statusCount[expense.status] = (current.statusCount[expense.status] || 0) + 1;
      current.allIds.push(expense._id);

      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      const dateEntry = current.dates[dateKey] || {
        items: [],
        statusCount: {
          Pending: 0,
          Approved: 0,
          Rejected: 0,
          Paid: 0,
        },
        totalAmount: 0,
      };
      dateEntry.items.push(expense);
      dateEntry.statusCount[expense.status] = (dateEntry.statusCount[expense.status] || 0) + 1;
      dateEntry.totalAmount += expense.amount;
      current.dates[dateKey] = dateEntry;

      salesmenMap.set(salesmanId, current);
    });

    return Array.from(salesmenMap.values()).sort((a, b) => a.salesman.name.localeCompare(b.salesman.name));
  }, [expenses]);

  if (!groupedData.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-slate-500">No expenses found for the selected filters.</div>
    );
  }

  const promptStatusChange = (expenseIds, status) => {
    if (!expenseIds.length) return;

    const statusMessages = {
      Pending: 'revert to Pending',
      Approved: 'approve',
      Rejected: 'reject',
      Paid: 'mark as Paid',
    };
    const actionMessage = statusMessages[status] || status.toLowerCase();
    const comment = window.prompt(`Add a comment for ${actionMessage} (optional):`, '');
    if (comment === null) return;

    expenseIds.forEach((id) => {
      onUpdateStatus({
        id,
        status,
        adminComment: comment || '',
      });
    });
  };

  const handleSingleStatusChange = (expense, status) => {
    promptStatusChange([expense._id], status);
  };

  const renderExpenseRow = (expense) => (
    <tr key={expense._id} className="hover:bg-slate-50/60">
      <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
        <div className="text-xs sm:text-sm">{format(new Date(expense.date), 'dd MMM yyyy')}</div>
        <div className="text-xs text-slate-500 hidden sm:block">{expense.location || '—'}</div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
        <div className="font-medium text-slate-800 text-xs sm:text-sm">{expense.category}</div>
        {expense.note && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{expense.note}</div>}
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 font-semibold text-slate-700 text-xs sm:text-sm">₹{expense.amount.toFixed(2)}</td>
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
                        onClick={() => handleSingleStatusChange(expense, 'Approved')}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-danger whitespace-nowrap"
                        onClick={() => handleSingleStatusChange(expense, 'Rejected')}
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
                        onClick={() => handleSingleStatusChange(expense, 'Paid')}
              >
                Mark Paid
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                        onClick={() => handleSingleStatusChange(expense, 'Pending')}
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
                        onClick={() => handleSingleStatusChange(expense, 'Approved')}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                        onClick={() => handleSingleStatusChange(expense, 'Pending')}
              >
                Undo Rejection
              </button>
            </>
          )}
          {expense.status === 'Paid' && (
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                      onClick={() => handleSingleStatusChange(expense, 'Approved')}
            >
              Undo Paid
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {groupedData.map((group) => {
        const sortedDates = Object.keys(group.dates).sort((a, b) => new Date(b) - new Date(a));

        return (
          <div key={group.salesman.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">{group.salesman.name}</p>
                <p className="text-xs text-slate-500">{group.salesman.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500 sm:text-xs">
                  <span>Pending: {group.statusCount?.Pending || 0}</span>
                  <span>Approved: {group.statusCount?.Approved || 0}</span>
                  <span>Rejected: {group.statusCount?.Rejected || 0}</span>
                  <span>Paid: {group.statusCount?.Paid || 0}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="text-xs sm:text-sm text-slate-500">
                  <p>Total expenses: {group.totals.count}</p>
                  <p>Total amount: ₹{group.totals.amount.toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-primary px-3 py-1.5 text-xs sm:text-sm"
                    onClick={() => promptStatusChange(group.allIds, 'Approved')}
                    disabled={!group.statusCount?.Pending && !group.statusCount?.Rejected}
                  >
                    Approve All
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs sm:text-sm"
                    onClick={() => promptStatusChange(group.allIds, 'Rejected')}
                    disabled={!group.statusCount?.Pending && !group.statusCount?.Approved}
                  >
                    Reject All
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs sm:text-sm"
                    onClick={() => promptStatusChange(group.allIds, 'Paid')}
                    disabled={!group.statusCount?.Approved}
                  >
                    Mark All Paid
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
                <thead className="bg-slate-50 text-left font-medium uppercase text-slate-500">
                  <tr>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Date</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Category</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Amount</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Status</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">Receipt</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedDates.map((dateKey) => {
                    const { items, statusCount, totalAmount } = group.dates[dateKey];
                    const dateLabel = format(new Date(dateKey), 'EEEE, dd MMM yyyy');
                    const dateIds = items.map((item) => item._id);

                    return (
                      <Fragment key={`${group.salesman.id}-${dateKey}`}>
                        <tr className="bg-slate-100/70 text-[11px] font-semibold uppercase text-slate-600 sm:text-xs">
                          <td colSpan={6} className="px-3 py-2 sm:px-4 sm:py-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-col gap-1">
                                <span>{dateLabel}</span>
                                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 sm:text-xs">
                                  <span>Pending: {statusCount.Pending || 0}</span>
                                  <span>Approved: {statusCount.Approved || 0}</span>
                                  <span>Rejected: {statusCount.Rejected || 0}</span>
                                  <span>Paid: {statusCount.Paid || 0}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:items-end">
                                <span className="font-semibold text-slate-700">Total: ₹{totalAmount.toFixed(2)}</span>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="btn-primary px-3 py-1 text-[10px] sm:text-xs"
                                    onClick={() => promptStatusChange(dateIds, 'Approved')}
                                    disabled={!statusCount.Pending && !statusCount.Rejected}
                                  >
                                    Approve All
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-secondary px-3 py-1 text-[10px] sm:text-xs"
                                    onClick={() => promptStatusChange(dateIds, 'Rejected')}
                                    disabled={!statusCount.Pending && !statusCount.Approved}
                                  >
                                    Reject All
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-secondary px-3 py-1 text-[10px] sm:text-xs"
                                    onClick={() => promptStatusChange(dateIds, 'Paid')}
                                    disabled={!statusCount.Approved}
                                  >
                                    Mark All Paid
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {items
                          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                          .map((expense) => renderExpenseRow(expense))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
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



