import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// 导入布局组件
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// 导入页面组件
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectDetail from './components/projects/ProjectDetail';
import ProjectForm from './components/projects/ProjectForm';
import TaskForm from './components/tasks/TaskForm';
import TaskDetail from './components/tasks/TaskDetail';
import NotFound from './components/NotFound';
import LoadingSpinner from './components/LoadingSpinner';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Navbar />
            <main className="container py-4 flex-grow-1">
              <Routes>
                {/* 公共路由 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 受保护的路由 */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute>
                      <ProjectList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/new" 
                  element={
                    <ProtectedRoute>
                      <ProjectForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/:id" 
                  element={
                    <ProtectedRoute>
                      <ProjectDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <ProjectForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/:projectId/tasks/new" 
                  element={
                    <ProtectedRoute>
                      <TaskForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tasks/:taskId" 
                  element={
                    <ProtectedRoute>
                      <TaskDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tasks/:taskId/edit" 
                  element={
                    <ProtectedRoute>
                      <TaskForm />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404页面 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;