import { useGetSystemStatsQuery } from '../features/apiSlice';
import { useNavigate } from 'react-router-dom';
import { Grid, Calendar, Users, ArrowRight } from 'lucide-react';

const SeatingList = () => {
  const { data: stats, isLoading } = useGetSystemStatsQuery();
  const navigate = useNavigate();

  // Unique exams from stats
  const exams = stats?.exams || [];

  if (isLoading) return <div className="p-8 text-white">Loading allocations...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Seating Allocations</h1>
        <p className="text-slate-400 mt-2">Select an exam to view its seating grid.</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
          <p className="text-slate-400">No allocations found. Go to the Dashboard to generate one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(examId => (
            <button
              key={examId}
              onClick={() => navigate(`/seating/${examId}`)}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-500/10 p-3 rounded-lg">
                  <Grid className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-mono text-slate-500">EXAM-REF</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{examId}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>View Grid</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatingList;
