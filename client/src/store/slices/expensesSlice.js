import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../services/api.js';
import { enqueueExpense, getPendingExpenses, removePendingExpense } from '../../utils/offlineQueue.js';
import { requestBackgroundSync } from '../../serviceWorker.js';
import { dataUrlToBlob } from '../../utils/image.js';
import { logout } from './authSlice.js';

const initialState = {
  items: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
  filters: {
    status: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
  },
  status: 'idle',
  error: null,
  pendingOffline: [],
};

export const fetchExpenses = createAsyncThunk('expenses/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    // Remove empty string parameters to avoid validation errors
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const response = await api.get('/expenses', { params: cleanParams });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Unable to fetch expenses';
    return rejectWithValue(message);
  }
});

export const createExpense = createAsyncThunk(
  'expenses/create',
  async ({ expense, imageFile, imageBase64 }, { rejectWithValue, getState }) => {
    try {
      const formData = new FormData();
      formData.append('category', expense.category);
      formData.append('amount', expense.amount);
      formData.append('date', expense.date);
      formData.append('location', expense.location || '');
      formData.append('note', expense.note || '');
      // Always add kilometers for Own Vehicle Fuel category (even if 0, so server knows to calculate)
      if (expense.category === 'Own Vehicle Fuel' && expense.kilometers !== null && expense.kilometers !== undefined) {
        formData.append('kilometers', String(expense.kilometers));
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return { expense: response.data, offline: false };
    } catch (error) {
      const isNetworkError = !error.response;
      if (isNetworkError) {
        const state = getState();
        const userId = state.auth.user?.id || null;
        const timestamp = new Date().toISOString();
        const offlineExpense = {
          ...expense,
          userId,
          createdAt: timestamp,
        };
        const queuedExpense = {
          expense: offlineExpense,
          imageBase64: imageBase64 || null,
          token: state.auth.token,
          apiUrl: api.defaults.baseURL,
        };
        const id = await enqueueExpense(queuedExpense);
        await requestBackgroundSync();

        return {
          expense: {
            ...offlineExpense,
            _id: `offline-${id}`,
            status: 'Pending',
            imageUrl: imageBase64 || '',
            isOffline: true,
            queueId: id,
            createdAt: timestamp,
          },
          offline: true,
          queueId: id,
        };
      }

      const message = error.response?.data?.message || 'Failed to save expense';
      return rejectWithValue(message);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, expense, imageFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(expense).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.put(`/expenses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Expense updated');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update expense';
      return rejectWithValue(message);
    }
  }
);

export const deleteExpense = createAsyncThunk('expenses/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/expenses/${id}`);
    toast.success('Expense deleted');
    return id;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete expense';
    return rejectWithValue(message);
  }
});

export const cancelOfflineExpense = createAsyncThunk('expenses/cancelOffline', async (queueId) => {
  await removePendingExpense(queueId);
  return queueId;
});

export const hydrateOfflineExpenses = createAsyncThunk('expenses/hydrateOffline', async (_, { getState }) => {
  const pending = await getPendingExpenses();
  const currentUserId = getState().auth.user?.id || null;

  return pending
    .filter((entry) => {
      if (!currentUserId || !entry.expense?.userId) {
        return true;
      }
      return entry.expense.userId === currentUserId;
    })
    .map((entry) => ({
      queueId: entry.id,
      expense: {
        ...entry.expense,
        _id: entry.expense?._id || `offline-${entry.id}`,
        status: 'Pending',
        isOffline: true,
        queueId: entry.id,
        imageUrl: entry.imageBase64 || entry.expense?.imageUrl || '',
        createdAt: entry.expense?.createdAt || new Date(entry.createdAt || Date.now()).toISOString(),
        amount: Number(entry.expense?.amount || 0),
      },
      imageBase64: entry.imageBase64 || null,
      apiUrl: entry.apiUrl || null,
    }));
});

export const syncOfflineExpenses = createAsyncThunk('expenses/syncOffline', async (_, { getState }) => {
  const pending = await getPendingExpenses();
  const currentUserId = getState().auth.user?.id || null;
  if (!pending.length) {
    return [];
  }

  const synced = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const entry of pending) {
    const { expense, imageBase64, token, id, apiUrl } = entry;
    if (currentUserId && expense?.userId && expense.userId !== currentUserId) {
      continue;
    }
    try {
      const formData = new FormData();
      formData.append('category', expense.category);
      formData.append('amount', expense.amount);
      formData.append('date', expense.date);
      formData.append('location', expense.location || '');
      formData.append('note', expense.note || '');

      if (imageBase64) {
        const blob = await dataUrlToBlob(imageBase64);
        const fileName = `receipt-${Date.now()}.png`;
        formData.append('image', blob, fileName);
      }

      const baseUrl = apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${baseUrl}/expenses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || getState().auth.token}`,
        },
        body: formData,
      });

      await removePendingExpense(id);
      synced.push({ ...expense, syncedAt: Date.now() });
    } catch (error) {
      console.error('Failed to sync offline expense', entry, error);
    }
  }

  if (synced.length) {
    toast.success(`${synced.length} offline expense(s) synced`);
  }

  return synced;
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearExpenses(state) {
      state.items = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const offlineExpenses = state.pendingOffline.map((item) => ({
          ...item.expense,
          isOffline: true,
        }));
        state.items = [...offlineExpenses, ...action.payload.data];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        if (action.payload.offline) {
          state.pendingOffline.push({
            queueId: action.payload.queueId,
            expense: action.payload.expense,
          });
          state.items = [action.payload.expense, ...state.items];
          toast.info('Expense stored offline. It will sync when you are online.');
        } else {
          state.items = [action.payload.expense, ...state.items];
          toast.success('Expense submitted');
        }
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(cancelOfflineExpense.fulfilled, (state, action) => {
        state.pendingOffline = state.pendingOffline.filter((item) => item.queueId !== action.payload);
        state.items = state.items.filter((item) => item.queueId !== action.payload);
        toast.info('Offline expense removed');
      })
      .addCase(syncOfflineExpenses.fulfilled, (state, action) => {
        if (action.payload.length) {
          state.pendingOffline = [];
          state.items = state.items.filter((item) => !item.isOffline);
          toast.success('Offline expenses synced successfully');
        }
      })
      .addCase(hydrateOfflineExpenses.fulfilled, (state, action) => {
        state.pendingOffline = action.payload;
        const hydrated = action.payload.map((item) => item.expense);
        const nonOffline = state.items.filter((item) => !item.isOffline);
        state.items = [...hydrated, ...nonOffline];
      })
      .addCase(logout, () => ({
        ...initialState,
      }));
  },
});

export const { setFilters, clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;

