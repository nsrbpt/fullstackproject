import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/apiSlice';
import { setCredentials } from '../features/authSlice';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({ adminId, password }).unwrap();
      dispatch(setCredentials({ token: userData.token }));
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err?.data?.message || err.message));
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-emerald-400">Mission Control</h2>
          <p className="mt-2 text-sm text-slate-400">Exam Seating Allocation Engine</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-slate-600 bg-slate-700/50 py-3 pl-10 px-3 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="Admin ID (e.g. 17903)"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-slate-600 bg-slate-700/50 py-3 pl-10 px-3 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-emerald-500 py-3 px-4 text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? 'Authenticating...' : 'Engage System'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
