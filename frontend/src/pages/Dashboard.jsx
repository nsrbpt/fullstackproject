import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateAllocationMutation } from '../features/apiSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const dummyData = [
  { name: 'Hall A', capacity: 100, occupied: 85 },
  { name: 'Hall B', capacity: 150, occupied: 140 },
  { name: 'Hall C', capacity: 80, occupied: 50 },
];

const Dashboard = () => {
  const [examId, setExamId] = useState('');
  const [generate, { isLoading }] = useGenerateAllocationMutation();
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">System Status Overview</h1>
        <p className="text-slate-400 mt-2">Real-time metrics for current seating allocations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium">Total Students</h3>
          <p className="text-4xl font-bold text-white mt-2">500</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium">Available Halls</h3>
          <p className="text-4xl font-bold text-emerald-400 mt-2">10</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium">System Readiness</h3>
          <p className="text-4xl font-bold text-blue-400 mt-2">100%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-96">
          <h2 className="text-xl font-bold text-white mb-6">Hall Occupancy Rate</h2>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={dummyData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Bar dataKey="capacity" fill="#3b82f6" name="Total Capacity" radius={[4, 4, 0, 0]} />
              <Bar dataKey="occupied" fill="#10b981" name="Occupied Seats" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center items-center">
          <h2 className="text-xl font-bold text-white mb-4">Initialize Allocation Sequence</h2>
          <p className="text-slate-400 text-center mb-8">
            Run the Column-Wise Zig-Zag allocation algorithm to interleave students across available halls.
          </p>
          <form onSubmit={handleGenerate} className="w-full max-w-sm space-y-4">
            <input
              type="text"
              required
              placeholder="Enter Exam ID (e.g. MIDTERM_2026)"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Executing Routine...' : 'Execute Allocation'}
            </button>
            <button
              type="button"
              onClick={() => {
                if(examId) navigate(`/seating/${examId}`);
              }}
              className="w-full rounded-lg bg-slate-700 py-3 text-sm font-bold text-white hover:bg-slate-600 transition-colors"
            >
              View Existing Allocation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
