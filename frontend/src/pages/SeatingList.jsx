import { useGetSystemStatsQuery, useDeleteAllocationMutation } from '../features/apiSlice';
import { useNavigate } from 'react-router-dom';
import { Grid, Trash2, Eye, Calendar, Users, Loader2 } from 'lucide-react';

const SeatingList = () => {
  const { data: stats, isLoading, error } = useGetSystemStatsQuery();
  const [deleteAllocation, { isLoading: isDeleting }] = useDeleteAllocationMutation();
  const navigate = useNavigate();

  const handleDelete = async (examId) => {
    if (window.confirm(`Are you sure you want to delete the allocation for ${examId}?`)) {
      try {
        await deleteAllocation(examId).unwrap();
        alert('Allocation deleted successfully');
      } catch (err) {
        alert('Failed to delete: ' + (err?.data?.message || err.message));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const exams = stats?.exams || [];

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-900">
      <div>
        <h1 className="text-3xl font-bold text-white">Manage Seating Allocations</h1>
        <p className="text-slate-400 mt-2">View, export, or remove previous exam seating records.</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No active allocations found in the archive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {exams.map(examId => (
            <div key={examId} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between hover:border-slate-500 transition-all shadow-lg group">
              <div className="flex items-center space-x-6">
                <div className="bg-emerald-500/10 p-4 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                  <Grid className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{examId}</h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Ready for Verification</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(`/seating/${examId}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-bold">View Grid</span>
                </button>
                <button
                  onClick={() => handleDelete(examId)}
                  disabled={isDeleting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-bold">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatingList;
