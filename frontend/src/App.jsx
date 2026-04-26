import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from './components/common/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SeatingView from './pages/SeatingView';
import Upload from './pages/Upload';

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/seating/:examId" element={<SeatingView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
