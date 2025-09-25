import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AttentionPage from "./pages/AttentionPage"; // Tambahkan import AttentionPage
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
  RiwayatPengembalian 
} from "./admin";
import FormDetail from "./admin/FormDetail";
import DetailKerusakan from "./admin/DetailKerusakan";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Routing baru untuk flow pengajuan */}
        <Route path="/apply/attention" element={<AttentionPage />} />
        <Route path="/apply/form" element={<MultiStepForm />} />
        <Route path="/status" element={<CekStatus />} />
        <Route path="/status/approved" element={<HasilCek />} />
        <Route path="/status/rejected" element={<HasilTolak />} />
        <Route path="/status/processing" element={<HasilProses />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/verifikasi" element={<VerifikasiPersetujuan />} />
        <Route path="/admin/kartu-visitor" element={<KartuVisitor />} />
        <Route path="/admin/riwayat" element={<RiwayatPengembalian />} />
        <Route path="/admin/form-detail" element={<FormDetail />} />
        <Route path="/admin/detail-kerusakan" element={<DetailKerusakan />} />
      </Routes>
    </Router>
  );
}

export default App;