import { createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice.js';

const initialState = {
  sidebarOpen: false,
  loadingMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
    showLoading(state, action) {
      state.loadingMessage = action.payload || 'Loading...';
    },
    hideLoading(state) {
      state.loadingMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => ({ ...initialState }));
  },
});

export const { toggleSidebar, closeSidebar, showLoading, hideLoading } = uiSlice.actions;
export default uiSlice.reducer;

