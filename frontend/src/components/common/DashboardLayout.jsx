import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { Building2, Grid, LayoutDashboard, LogOut, UploadCloud } from 'lucide-react';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
    }`;

  return (
    <div className="flex min-h-screen bg-app-gradient text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-800 bg-slate-950/70 p-5 backdrop-blur md:flex">
        <div className="border-b border-slate-800 pb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Admin Console</p>
          <h1 className="mt-2 text-xl font-semibold text-white">Exam Seating System</h1>
        </div>
        <nav className="mt-5 flex-1 space-y-2">
          <NavLink to="/" end className={navItemClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/upload" className={navItemClass}>
            <UploadCloud className="h-4 w-4" />
            Data Ingestion
          </NavLink>
          <NavLink to="/halls" className={navItemClass}>
            <Building2 className="h-4 w-4" />
            Hall Administration
          </NavLink>
          <NavLink to="/seating" className={navItemClass}>
            <Grid className="h-4 w-4" />
            Manage Allocations
          </NavLink>
        </nav>

        <div className="border-t border-slate-800 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-rose-500/30 px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Exam Seating System</p>
            <button
              onClick={handleLogout}
              className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300"
            >
              Logout
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <NavLink to="/" end className={navItemClass}>
              Dashboard
            </NavLink>
            <NavLink to="/upload" className={navItemClass}>
              Upload
            </NavLink>
            <NavLink to="/halls" className={navItemClass}>
              Halls
            </NavLink>
            <NavLink to="/seating" className={navItemClass}>
              Seating
            </NavLink>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
