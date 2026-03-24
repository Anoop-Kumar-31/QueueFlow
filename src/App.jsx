import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from './features/authSlice';

import Loading from './components/Loading';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TasksBoard from './pages/TasksBoard';
import ProjectBoard from './pages/ProjectBoard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AppLayout from './components/AppLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/" />;
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isServerAwake, setIsServerAwake] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Ping the server health endpoint to wake up Render + Supabase DB
      if (!isServerAwake) {
        try {
          await fetch(import.meta.env.VITE_API_URL + '/health');
        } catch (e) {
          console.error("Backend health check failed, but proceeding...", e);
        }
        setIsServerAwake(true);
      }

      // 2. Load user session
      if (token && !user) {
        dispatch(fetchUser());
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch, token, user, isServerAwake]);

  if (isInitializing || !isServerAwake) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TasksBoard />} />
          <Route path="project/:projectId" element={<ProjectBoard />} />
          <Route path="project/:projectId/analytics" element={<AnalyticsDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
