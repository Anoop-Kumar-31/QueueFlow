import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import authReducer from './features/authSlice';
import projectReducer from './features/projectSlice';
import tasksReducer from './features/tasksSlice';

// Create synchronous, deterministic web storage layer bypassing Vite ESM glitches with lib/storage
const webStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, item) => Promise.resolve(window.localStorage.setItem(key, item)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key))
};

const persistConfig = {
  key: 'root',
  storage: webStorage,
  whitelist: ['auth'] // Only persist the auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  tasks: tasksReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
