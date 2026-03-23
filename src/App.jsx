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

  useEffect(() => {
    const initializeAuth = async () => {
      // If we have a token but no user data (e.g. from a page refresh)
      if (token && !user) {
        await dispatch(fetchUser());
      }
      await setTimeout(() => setIsInitializing(false), 2000);
    };

    initializeAuth();
  }, [dispatch, token, user]);

  if (isInitializing) {
    return (
      <Loading message="Loading Workspace" textSize="text-3xl" iconSize="w-4 h-4" iconColor="bg-primary" />
    );
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
