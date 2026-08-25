import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import StudentFormPage from './pages/StudentFormPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminDetailPage from './pages/admin/AdminDetailPage.jsx';
import AdminBatchesPage from './pages/admin/AdminBatchesPage.jsx';
import FormBuilderPage from './pages/admin/FormBuilderPage.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { ProtectedRoute } from './components/admin/ProtectedRoute.jsx';
import { AdminLayout } from './components/admin/AdminLayout.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<StudentFormPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/success/:id" element={<SuccessPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="submissions/:id" element={<AdminDetailPage />} />
            <Route path="batches" element={<AdminBatchesPage />} />
            <Route path="form-builder" element={<FormBuilderPage />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
