import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ResponsiveSidebar } from "./components/layout/ResponsiveSidebar";
import { AuthProvider } from "./context/AuthContext";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Fees from "./pages/Fees";
import Grades from "./pages/Grades";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Schedule from "./pages/Schedule";
import Students from "./pages/Students";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col sm:flex-row">
        <ResponsiveSidebar />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedLayout />}>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="/students"
              element={
                <ErrorBoundary>
                  <Students />
                </ErrorBoundary>
              }
            />
            <Route
              path="/attendance"
              element={
                <ErrorBoundary>
                  <Attendance />
                </ErrorBoundary>
              }
            />
            <Route
              path="/grades"
              element={
                <ErrorBoundary>
                  <Grades />
                </ErrorBoundary>
              }
            />
            <Route
              path="/fees"
              element={
                <ErrorBoundary>
                  <Fees />
                </ErrorBoundary>
              }
            />
            <Route
              path="/schedule"
              element={
                <ErrorBoundary>
                  <Schedule />
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
