import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateAllocationMutation, useGetSystemStatsQuery } from '../features/apiSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [examId, setExamId] = useState('');
  const { data: stats, isLoading: statsLoading } = useGetSystemStatsQuery();
  const [generate, { isLoading: isGenerating }] = useGenerateAllocationMutation();
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await generate({ examId }).unwrap();
      navigate(`/seating/${examId}`);
    } catch (err) {
      alert('Generation Failed: ' + (err?.data?.message || err.message));
    }
  };

  if (statsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Mission Control</h1>
          <p className="text-slate-400 mt-2">Real-time metrics and system orchestration.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Students</h3>
          <p className="text-4xl font-bold text-white mt-2">{stats?.studentCount || 0}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Available Halls</h3>
          <p className="text-4xl font-bold text-blue-400 mt-2">{stats?.hallCount || 0}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Exams</h3>
          <p className="text-4xl font-bold text-emerald-400 mt-2">{stats?.examCount || 0}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Readiness</h3>
          <p className="text-4xl font-bold text-purple-400 mt-2">{stats?.studentCount > 0 ? '100%' : '0%'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 h-[400px]">
          <h2 className="text-xl font-bold text-white mb-6">Recent Allocations</h2>
          {stats?.exams?.length > 0 ? (
            <div className="space-y-3">
              {stats.exams.slice(0, 5).map(id => (
                <div key={id} onClick={() => navigate(`/seating/${id}`)} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer border border-transparent hover:border-emerald-500 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="bg-emerald-500/20 p-2 rounded">
                      <Plus className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{id}</p>
                      <p className="text-slate-400 text-xs">Allocation Ready</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <p>No active exams found.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-800 p-8 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-2">New Allocation</h2>
          <p className="text-slate-400 text-sm mb-8">
            Initialize the zig-zag interleaving algorithm for a new exam batch.
          </p>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Exam Reference ID</label>
              <input
                type="text"
                required
                placeholder="e.g. ENDTERM_2024"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-emerald-500 py-4 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Start Allocation</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
