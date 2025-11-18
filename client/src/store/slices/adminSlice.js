import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../services/api.js';

const initialState = {
  expenses: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  },
  filters: {
    status: '',
    salesman: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
  },
  status: 'idle',
  error: null,
  salesmen: [],
  reports: {
    summary: null,
    byCategory: [],
    bySalesman: [],
    timeline: [],
  },
};

export const fetchAdminExpenses = createAsyncThunk('admin/fetchExpenses', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/expenses', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Unable to fetch expenses';
    return rejectWithValue(message);
  }
});

export const updateAdminExpenseStatus = createAsyncThunk(
  'admin/updateStatus',
  async ({ id, status, adminComment }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/expenses/${id}`, { status, adminComment });
      toast.success('Expense updated');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchSalesmen = createAsyncThunk('admin/fetchSalesmen', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/salesmen');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Unable to fetch salesmen';
    return rejectWithValue(message);
  }
});

export const fetchReports = createAsyncThunk('admin/fetchReports', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Unable to load reports';
    return rejectWithValue(message);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.expenses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(updateAdminExpenseStatus.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(updateAdminExpenseStatus.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(fetchSalesmen.fulfilled, (state, action) => {
        state.salesmen = action.payload;
      })
      .addCase(fetchSalesmen.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { setAdminFilters } = adminSlice.actions;
export default adminSlice.reducer;









