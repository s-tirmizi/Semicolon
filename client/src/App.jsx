import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useAppContext } from "./context/AppContext";
import ApplyPage from "./pages/ApplyPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import IntakePage from "./pages/IntakePage";
import LoginPage from "./pages/LoginPage";
import ResultsPage from "./pages/ResultsPage";
import SignupPage from "./pages/SignupPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/apply" element={<ApplyPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
