import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api, { setAuthToken } from '../../services/api.js';

const STORAGE_KEY = 'printo_auth';

const loadStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { user: null, token: null };
    }
    const parsed = JSON.parse(stored);
    if (parsed?.token) {
      setAuthToken(parsed.token);
      window.localStorage.setItem('printo_token', parsed.token);
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse stored auth', error);
    return { user: null, token: null };
  }
};

const persistAuth = (payload) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.localStorage.setItem('printo_token', payload.token || '');
};

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', formData);
    return response.data;
  } catch (error) {
    // Handle validation errors
    if (error.response?.data?.errors) {
      const messages = error.response.data.errors.join(', ');
      return rejectWithValue(messages);
    }
    const message = error.response?.data?.message || error.message || 'Registration failed. Please check your connection.';
    return rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', formData);
    console.log('Login response:', response.data);
    // Ensure user object has role property
    if (response.data?.user && !response.data.user.role) {
      console.warn('Warning: User object missing role property');
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    const message = error.response?.data?.message || 'Unable to fetch profile';
    return rejectWithValue(message);
  }
});

const { user: storedUser, token: storedToken } = loadStoredAuth();

const initialState = {
  user: storedUser,
  token: storedToken,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem('printo_token');
      }
      setAuthToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        setAuthToken(action.payload.token);
        persistAuth({ user: action.payload.user, token: action.payload.token });
        toast.success('Registration successful');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
        toast.error(state.error);
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        console.log('Login successful, user:', action.payload.user);
        console.log('User role:', action.payload.user?.role);
        setAuthToken(action.payload.token);
        persistAuth({ user: action.payload.user, token: action.payload.token });
        toast.success(`Welcome back, ${action.payload.user.name}`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
        toast.error(state.error);
      })
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        persistAuth({ user: action.payload, token: state.token });
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.token = null;
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem('printo_token');
        }
        setAuthToken(null);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

