import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AttentionPage from "./pages/AttentionPage";
import MultiStepForm from "./pages/MultiStepForm";
import CekStatus from "./pages/CekStatus";
import HasilCek from "./pages/HasilCek";
import HasilTolak from "./pages/HasilTolak";
import HasilProses from "./pages/HasilProses";

import {
  AdminLogin,
  Dashboard,
  VerifikasiPersetujuan,
  KartuVisitor,
  RiwayatPengembalian,
} from "./admin";
import FormDetail from "./admin/FormDetail";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply/attention" element={<AttentionPage />} />
        <Route path="/apply/step-1" element={<MultiStepForm />} />
        <Route path="/apply" element={<Navigate to="/apply/step-1" replace />} />
        <Route path="/status" element={<CekStatus />} />
        <Route path="/status/approved" element={<HasilCek />} />
        <Route path="/status/rejected" element={<HasilTolak />} />
        <Route path="/status/processing" element={<HasilProses />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/verifikasi"
          element={
            <RequireAuth>
              <VerifikasiPersetujuan />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/kartu-visitor"
          element={
            <RequireAuth>
              <KartuVisitor />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/riwayat"
          element={
            <RequireAuth>
              <RiwayatPengembalian />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/detail/:reference"
          element={
            <RequireAuth>
              <FormDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/form-detail"
          element={
            <RequireAuth>
              <FormDetail />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
