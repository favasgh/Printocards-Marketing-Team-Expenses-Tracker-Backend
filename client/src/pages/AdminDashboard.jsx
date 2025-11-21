import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../services/api.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import AdminFilters from '../components/AdminFilters.jsx';
import DashboardStats from '../components/DashboardStats.jsx';
import AdminExpenseTable from '../components/AdminExpenseTable.jsx';
import Pagination from '../components/Pagination.jsx';
import CategoryChart from '../components/charts/CategoryChart.jsx';
import SalesmanChart from '../components/charts/SalesmanChart.jsx';
import TimelineChart from '../components/charts/TimelineChart.jsx';
import { fetchAdminExpenses, fetchReports, fetchSalesmen, setAdminFilters, updateAdminExpenseStatus } from '../store/slices/adminSlice.js';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { expenses, pagination, filters, status, reports, salesmen } = useSelector((state) => state.admin);
  const [page, setPage] = useState(1);
  const [interval, setInterval] = useState('monthly');

  useEffect(() => {
    dispatch(fetchSalesmen());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAdminExpenses({
        page,
        limit: pagination.limit,
        ...filters,
        interval, // Pass interval to backend for date range calculation
      })
    );
  }, [dispatch, page, filters.status, filters.salesman, filters.category, filters.startDate, filters.endDate, filters.search, interval]);

  useEffect(() => {
    dispatch(
      fetchReports({
        ...filters,
        interval,
      })
    );
  }, [dispatch, filters.status, filters.salesman, filters.category, filters.startDate, filters.endDate, filters.search, interval]);

  const stats = useMemo(() => {
    const summary = reports.summary || {
      totalAmount: 0,
      totalExpenses: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
    };

    return [
      { label: 'Total Amount', value: `₹${(summary.totalAmount || 0).toFixed(2)}` },
      { label: 'Total Expenses', value: summary.totalExpenses || 0 },
      { label: 'Pending', value: summary.pending || 0 },
      { label: 'Approved', value: summary.approved || 0 },
      { label: 'Rejected', value: summary.rejected || 0 },
      { label: 'Paid', value: summary.paid || 0 },
    ];
  }, [reports.summary]);

  const handleFiltersChange = (nextFilters) => {
    dispatch(setAdminFilters(nextFilters));
    setPage(1);
  };

  const handleStatusUpdate = async (payload) => {
    const result = await dispatch(updateAdminExpenseStatus(payload));
    if (updateAdminExpenseStatus.fulfilled.match(result)) {
      // Refetch expenses and reports to ensure data is in sync
      dispatch(
        fetchAdminExpenses({
          page,
          limit: pagination.limit,
          ...filters,
          interval,
        })
      );
      dispatch(
        fetchReports({
          ...filters,
          interval,
        })
      );
    }
  };

  const handleExport = async (format) => {
    try {
      const params = {
        ...filters,
        interval,
        format,
      };
      
      // Remove empty values from params
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/admin/reports', {
        params,
        responseType: 'blob', // Important for file downloads
      });

      // Determine file extension and MIME type
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const mimeType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `printo-expenses-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.message || 'Failed to export report');
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      
      actions={
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium text-slate-600 hidden sm:block">Period:</label>
            <select
              className="input-field w-auto min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm"
              value={interval}
              onChange={(event) => {
                setInterval(event.target.value);
                setPage(1);
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="button" className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap" onClick={() => handleExport('excel')}>
            Export Excel
          </button>
          <button type="button" className="btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap" onClick={() => handleExport('pdf')}>
            Export PDF
          </button>
        </div>
      }
    >
      <DashboardStats stats={stats} />
      <AdminFilters filters={filters} salesmen={salesmen} onChange={handleFiltersChange} />
      <div className="grid gap-4 sm:gap-3 md:gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 sm:p-4 md:p-4 lg:col-span-1">
          <h3 className="text-lg sm:text-base md:text-sm font-semibold text-slate-600">By Category</h3>
          <CategoryChart data={reports.byCategory} />
        </div>
        <div className="glass-card p-5 sm:p-4 md:p-4 lg:col-span-2">
          <h3 className="text-lg sm:text-base md:text-sm font-semibold text-slate-600">By Salesman</h3>
          <SalesmanChart data={reports.bySalesman} users={salesmen} />
        </div>
      </div>
      <div className="glass-card p-5 sm:p-4 md:p-4">
        <h3 className="text-lg sm:text-base md:text-sm font-semibold text-slate-600">Expense Timeline</h3>
        <TimelineChart data={reports.timeline} />
      </div>
      <AdminExpenseTable expenses={expenses} onUpdateStatus={handleStatusUpdate} />
      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      {status === 'loading' && <p className="text-center text-sm text-slate-500">Loading latest expenses...</p>}
    </DashboardLayout>
  );
};

export default AdminDashboard;



