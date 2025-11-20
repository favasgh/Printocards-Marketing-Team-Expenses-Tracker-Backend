import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import expensesReducer from './slices/expensesSlice.js';
import adminReducer from './slices/adminSlice.js';
import uiReducer from './slices/uiSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
});

export default store;











