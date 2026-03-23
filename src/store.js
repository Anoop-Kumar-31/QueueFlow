import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import projectReducer from './features/projectSlice';
import tasksReducer from './features/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: tasksReducer
  }
});
