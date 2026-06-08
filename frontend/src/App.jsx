import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import DealsPage from "./pages/DealsPage";
import TemplatesPage from "./pages/TemplatesPage";
import PaymentsPage from "./pages/PaymentsPage";
import SitesPage from "./pages/SitesPage";
import PreviewPage from "./pages/PreviewPage";
import AdminLayout from "./components/Layout/AdminLayout";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/preview/:token" element={<PreviewPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="sites" element={<SitesPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}