import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { LogOut, LayoutDashboard, UploadCloud, Grid } from 'lucide-react';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold font-mono text-emerald-400">Mission Control</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-slate-400" />
            <span>Dashboard</span>
          </Link>
          <Link to="/upload" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <UploadCloud className="w-5 h-5 text-slate-400" />
            <span>Data Ingestion</span>
          </Link>
          <Link to="/seating" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <Grid className="w-5 h-5 text-slate-400" />
            <span>Seating Grids</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
