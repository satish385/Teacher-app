import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import TeacherDashboard from './pages/teacher/Dashboard';
import SyllabusManager from './pages/teacher/SyllabusManager';
import ClassTracker from './pages/teacher/ClassTracker';
import DocumentManager from './pages/teacher/DocumentManager';
import PublicationManager from './pages/teacher/publications';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherManager from './pages/admin/TeacherManager';
import Timetable from './pages/teacher/Timetable';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'teacher' | 'admin' }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="dashboard"
            element={
              user?.role === 'admin' ? (
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              ) : (
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="syllabus"
            element={
              <ProtectedRoute allowedRole="teacher">
                <SyllabusManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes"
            element={
              <ProtectedRoute allowedRole="teacher">
                <ClassTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents"
            element={
              <ProtectedRoute allowedRole="teacher">
                <DocumentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="publications"
            element={
              <ProtectedRoute allowedRole="teacher">
                <PublicationManager />
              </ProtectedRoute>
            }
          />
           <Route
            path="timetable"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Timetable />
              </ProtectedRoute>
            }
          />         

          <Route
            path="teachers"
            element={
              <ProtectedRoute allowedRole="admin">
                <TeacherManager />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;