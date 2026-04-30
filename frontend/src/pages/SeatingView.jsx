import { useParams } from 'react-router-dom';
import { useGetAllocationQuery } from '../features/apiSlice';
import { generateHallReport, generateDoorSignage, generateStudentSlips } from '../services/pdfService';
import { Loader2, Printer, Download } from 'lucide-react';

const SeatingView = () => {
  const { examId } = useParams();
  const { data: allocations, isLoading, error } = useGetAllocationQuery(examId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-gray-50 dark:bg-slate-900">Failed to load: {error?.data?.message || 'Unknown Error'}</div>
    );
  }

  if (!allocations || allocations.length === 0) {
    return (
      <div className="p-8 text-slate-600 bg-gray-50 dark:bg-slate-900">No allocations found for this Exam ID.</div>
    );
  }

  // Group seats by hall
  const groupedByHall = {};
  allocations.forEach(a => {
    const hallName = a.hallId.name;
    groupedByHall[hallName] = groupedByHall[hallName] || { info: a.hallId, seats: [] };
    groupedByHall[hallName].seats.push(a);
  });

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Seating Allocation Viewer</h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Exam ID: <span className="font-mono text-emerald-600 dark:text-emerald-400">{examId}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateHallReport(allocations, examId)}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md transition-colors border border-slate-600"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Hall List</span>
          </button>
          <button
            onClick={() => generateDoorSignage(allocations, examId)}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md transition-colors border border-slate-600"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm">Door Signage</span>
          </button>
          <button
            onClick={async () => await generateStudentSlips(allocations, examId)}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md transition-colors border border-slate-600"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm">Student Slips</span>
          </button>
        </div>
      </header>

      {/* Hall sections */}
      {Object.entries(groupedByHall).map(([hallName, hallData]) => {
        const { rows, cols, capacity } = hallData.info;
        const matrix = Array.from({ length: rows }, () => Array(cols).fill(null));
        hallData.seats.forEach(seat => {
          if (seat.row <= rows && seat.col <= cols) {
            matrix[seat.row - 1][seat.col - 1] = seat;
          }
        });

        return (
          <section key={hallName} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">{hallName}</h2>
              <span className="text-sm bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300">
                Occupancy: {hallData.seats.length} / {capacity}
              </span>
            </div>
            <div
              className="grid gap-1 p-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {matrix.flat().map((seat, idx) => (
                <div
                  key={idx}
                  title={seat ? `${seat.studentId.name} (${seat.studentId.department})` : 'Empty'}
                  className={`h-12 flex items-center justify-center text-[10px] font-mono border rounded ${seat ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 text-emerald-800 dark:text-emerald-200' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 text-gray-500'}`}
                >
                  {seat ? seat.studentId.rollNumber : ''}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default SeatingView;
