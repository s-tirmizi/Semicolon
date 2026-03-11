import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ApplyPage from "./pages/ApplyPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import IntakePage from "./pages/IntakePage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
