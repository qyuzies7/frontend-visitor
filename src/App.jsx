import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
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
import FormDetail from "./admin/FormDetail"; // Tambahkan untuk halaman detail visitor

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<MultiStepForm />} />
        <Route path="/status" element={<CekStatus />} />
        <Route path="/status/approved" element={<HasilCek />} />
        <Route path="/status/rejected" element={<HasilTolak />} />
        <Route path="/status/processing" element={<HasilProses />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/verifikasi" element={<VerifikasiPersetujuan />} />
        <Route path="/admin/kartu-visitor" element={<KartuVisitor />} />
        <Route path="/admin/riwayat" element={<RiwayatPengembalian />} />
        <Route path="/admin/form-detail" element={<FormDetail />} /> {/* Route detail visitor */}
      </Routes>
    </Router>
  );
}

export default App;