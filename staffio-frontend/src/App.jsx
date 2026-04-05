import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/AdminLayout';
import EmployeeLayout from './pages/EmployeeLayout';
import Dashboard from './components/admin/Dashboard';
import EmployeeList from './components/admin/EmployeeList';
import ShiftManager from './components/admin/ShiftManager';
import QrGenerator from './components/admin/QrGenerator';
import Statistics from './components/admin/Statistics';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import Profile from './components/employee/Profile';
import ShiftRegistration from './components/employee/ShiftRegistration';
import MySchedule from './components/employee/MySchedule';
import QrScanner from './components/employee/QrScanner';
import Loading from './components/common/Loading';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/employee'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="shifts" element={<ShiftManager />} />
          <Route path="attendance" element={<QrGenerator />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>

        <Route
          path="/employee"
          element={
            <ProtectedRoute role="EMPLOYEE">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="shifts" element={<ShiftRegistration />} />
          <Route path="schedule" element={<MySchedule />} />
          <Route path="scan" element={<QrScanner />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
