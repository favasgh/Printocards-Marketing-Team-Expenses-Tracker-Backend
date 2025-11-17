import PropTypes from 'prop-types';
import { useState } from 'react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge.jsx';
import { fileToBase64 } from '../utils/image.js';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const startEditing = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      category: expense.category,
      amount: expense.amount,
      date: expense.date ? expense.date.slice(0, 10) : '',
      location: expense.location || '',
      note: expense.note || '',
    });
    setPreview(expense.imageUrl || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setFile(null);
    setPreview('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreview('');
      return;
    }
    setFile(selected);
    if (selected.type.startsWith('image/')) {
      const base64 = await fileToBase64(selected);
      setPreview(base64);
    } else {
      setPreview('');
    }
  };

  const saveChanges = () => {
    if (!editingId) return;
    onEdit({
      id: editingId,
      expense: {
        ...editForm,
        amount: Number(editForm.amount),
      },
      imageFile: file,
    });
    cancelEditing();
  };

  if (!expenses.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-slate-500">
        No expenses found. Submit a new expense to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs sm:text-sm md:text-sm lg:text-xs font-medium uppercase text-slate-500">
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Category</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Amount</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">Date</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden md:table-cell">Location</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Status</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">Receipt</th>
            <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm md:text-sm">
          {expenses.map((expense) => {
            const isEditing = editingId === expense._id;
            return (
              <tr key={expense._id} className="hover:bg-slate-50/60">
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                  {isEditing ? (
                    <input
                      name="category"
                      value={editForm.category}
                      onChange={handleInputChange}
                      className="input-field text-xs sm:text-sm"
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">{expense.category}</p>
                      {expense.note && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{expense.note}</p>}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                  {isEditing ? (
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.amount}
                      onChange={handleInputChange}
                      className="input-field text-xs sm:text-sm"
                    />
                  ) : (
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">₹{expense.amount.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">
                  {isEditing ? (
                    <input name="date" type="date" value={editForm.date} onChange={handleInputChange} className="input-field text-xs sm:text-sm" />
                  ) : expense.date ? (
                    <span className="text-xs sm:text-sm">{format(new Date(expense.date), 'dd MMM yyyy')}</span>
                  ) : (
                    <span className="text-xs text-slate-400">Not set</span>
                  )}
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden md:table-cell">
                  {isEditing ? (
                    <input name="location" value={editForm.location} onChange={handleInputChange} className="input-field text-xs sm:text-sm" />
                  ) : (
                    <span className="text-xs sm:text-sm">{expense.location || '—'}</span>
                  )}
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={expense.status} />
                    {expense.isOffline && <span className="text-xs text-warning">Queued</span>}
                    {expense.approvedBy && expense.status !== 'Pending' && (
                      <span className="text-xs text-slate-500 hidden sm:block">
                        {expense.status === 'Approved' && 'Approved by '}
                        {expense.status === 'Rejected' && 'Rejected by '}
                        {expense.status === 'Paid' && 'Paid by '}
                        <span className="font-medium">{expense.approvedBy.name || expense.approvedBy.email}</span>
                      </span>
                    )}
                    {expense.adminComment && (
                      <span className="text-xs text-slate-500 italic line-clamp-1">"{expense.adminComment}"</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 hidden sm:table-cell">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="text-xs sm:text-sm" />
                      {preview && <img src={preview} alt="Preview" className="h-10 w-10 rounded border object-cover" />}
                    </div>
                  ) : expense.imageUrl ? (
                    <a
                      href={expense.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs sm:text-sm text-primary hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No file</span>
                  )}
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                  {expense.isOffline ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">Pending sync</span>
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-danger whitespace-nowrap"
                        onClick={() => onDelete(expense)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : expense.status === 'Pending' ? (
                    isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button type="button" className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap" onClick={saveChanges}>
                          Save
                        </button>
                        <button type="button" className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
                          onClick={() => startEditing(expense)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-danger whitespace-nowrap"
                          onClick={() => onDelete(expense)}
                        >
                          Delete
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Locked</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

ExpenseList.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string,
      location: PropTypes.string,
      note: PropTypes.string,
      status: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      isOffline: PropTypes.bool,
      queueId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      approvedBy: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      adminComment: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ExpenseList;

