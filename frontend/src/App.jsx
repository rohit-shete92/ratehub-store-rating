import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';
import StoreManagement from './pages/admin/StoreManagement';
import StoreList from './pages/user/StoreList';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/change-password" element={<ChangePassword />} />

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/users/:id" element={<UserDetails />} />
                <Route path="/admin/stores" element={<StoreManagement />} />
              </Route>

              <Route element={<ProtectedRoute roles={['user']} />}>
                <Route path="/stores" element={<StoreList />} />
              </Route>

              <Route element={<ProtectedRoute roles={['store_owner']} />}>
                <Route path="/owner" element={<OwnerDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
