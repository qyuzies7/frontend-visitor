import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MultiStepForm from './pages/MultiStepForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<MultiStepForm />} />
        <Route path="/status" element={<MultiStepForm initialStep={5} />} />
      </Routes>
    </Router>
  );
}

export default App;