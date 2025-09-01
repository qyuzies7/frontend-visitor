<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MultiStepForm from './pages/MultiStepForm';
=======
// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisitorCardStatus from "./pages/CekStatus";
import HasilCek from "./pages/HasilCek";
import HasilTolak from './pages/HasilTolak'
import HasilProses from "./pages/HasilProses";
>>>>>>> 9460421f6ad1c56c48c914031237b771bc89e362

function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<MultiStepForm />} />
        <Route path="/status" element={<MultiStepForm initialStep={5} />} />
=======
        <Route path="/" element={<VisitorCardStatus />} />
        <Route path="/HasilCek" element={<HasilCek />} />
        <Route path="/HasilTolak" element={<HasilTolak />} />
        <Route path="/HasilProses" element={<HasilProses />} />
>>>>>>> 9460421f6ad1c56c48c914031237b771bc89e362
      </Routes>
    </Router>
  );
}

export default App;