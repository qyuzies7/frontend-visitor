// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisitorCardStatus from "./pages/CekStatus";
import HasilCek from "./pages/HasilCek";
import HasilTolak from './pages/HasilTolak'
import HasilProses from "./pages/HasilProses";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VisitorCardStatus />} />
        <Route path="/HasilCek" element={<HasilCek />} />
        <Route path="/HasilTolak" element={<HasilTolak />} />
        <Route path="/HasilProses" element={<HasilProses />} />
      </Routes>
    </Router>
  );
}

export default App;