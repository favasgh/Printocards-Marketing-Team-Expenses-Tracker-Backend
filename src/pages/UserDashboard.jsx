import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import ExpenseFilters from '../components/ExpenseFilters.jsx';
import ExpenseList from '../components/ExpenseList.jsx';
import Pagination from '../components/Pagination.jsx';
import DashboardStats from '../components/DashboardStats.jsx';
import {
  fetchExpenses,
  setFilters,
  updateExpense,
  deleteExpense,
  cancelOfflineExpense,
} from '../store/slices/expensesSlice.js';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { items, pagination, filters, status, pendingOffline } = useSelector((state) => state.expenses);
  const { user, token } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const hasInitialFetched = useRef(false);
  const lastUserId = useRef(null);

  // Fetch expenses on initial load (page refresh or login) - without filters to show all data
  useEffect(() => {
    if (token && user) {
      const userId = user.id || user._id;
      if (userId && (userId !== lastUserId.current || !hasInitialFetched.current)) {
        lastUserId.current = userId;
        hasInitialFetched.current = true;
        setPage(1);
        // Fetch all expenses without filters on initial load
        dispatch(
          fetchExpenses({
            page: 1,
            limit: 10,
          })
        );
      }
    }
    
    // Reset when user logs out
    if (!token || !user) {
      hasInitialFetched.current = false;
      lastUserId.current = null;
      setPage(1);
    }
  }, [dispatch, token, user?.id, user?._id]); // Fetch when user ID changes (login or refresh)

  // Fetch expenses when filters or page change
  useEffect(() => {
    if (token && user?.id && page > 0) {
      dispatch(
        fetchExpenses({
          page,
          limit: pagination.limit || 10,
          ...filters,
        })
      );
    }
  }, [dispatch, page, filters.status, filters.category, filters.startDate, filters.endDate, filters.search]);

  const stats = useMemo(() => {
    const onlineItems = items.filter((item) => !item.isOffline);
    const total = onlineItems.reduce((sum, item) => sum + item.amount, 0);
    const pending = items.filter((item) => item.status === 'Pending').length;
    const approved = items.filter((item) => item.status === 'Approved').length;
    const rejected = items.filter((item) => item.status === 'Rejected').length;
    const paid = items.filter((item) => item.status === 'Paid').length;

    return [
      { label: 'Total Amount (current page)', value: `₹${total.toFixed(2)}` },
      { label: 'Total Expenses', value: items.length },
      { label: 'Pending', value: pending },
      { label: 'Approved', value: approved },
      { label: 'Rejected', value: rejected },
      { label: 'Paid', value: paid },
    ];
  }, [items]);

  const handleFiltersChange = (nextFilters) => {
    dispatch(setFilters(nextFilters));
    setPage(1);
  };

  const handleEdit = (payload) => {
    dispatch(updateExpense(payload));
  };

  const handleDelete = (expense) => {
    if (expense.isOffline && expense.queueId) {
      dispatch(cancelOfflineExpense(expense.queueId));
    } else {
      dispatch(deleteExpense(expense._id));
    }
  };

  const handleExpenseCreated = () => {
    setPage(1);
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      dispatch(
        fetchExpenses({
          page: 1,
          limit: pagination.limit,
          ...filters,
        })
      );
    }
  };

  return (
    <DashboardLayout
      title="My Expenses"
      subtitle="Track and manage your daily field expenses"
      actions={<span className="hidden text-sm text-slate-500 md:block">{status === 'loading' ? 'Refreshing...' : ''}</span>}
    >
      <DashboardStats stats={stats} />
      <ExpenseForm onSuccess={handleExpenseCreated} />
      <ExpenseFilters filters={filters} onChange={handleFiltersChange} />
      <ExpenseList expenses={items} onEdit={handleEdit} onDelete={handleDelete} />
      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
    </DashboardLayout>
  );
};

export default UserDashboard;

