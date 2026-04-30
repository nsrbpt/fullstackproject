import { useMemo, useState } from 'react';
import {
  useCreateHallMutation,
  useDeleteHallMutation,
  useGetHallsQuery,
  useUpdateHallMutation,
} from '../features/apiSlice';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

const initialForm = { name: '', rows: 10, cols: 6 };

const HallsAdmin = () => {
  const { data: halls = [], isLoading, error } = useGetHallsQuery();
  const [createHall, { isLoading: isCreating }] = useCreateHallMutation();
  const [updateHall, { isLoading: isUpdating }] = useUpdateHallMutation();
  const [deleteHall, { isLoading: isDeleting }] = useDeleteHallMutation();

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const totalCapacity = useMemo(
    () => halls.reduce((sum, hall) => sum + Number(hall.capacity || 0), 0),
    [halls]
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      name: form.name.trim(),
      rows: Number(form.rows),
      cols: Number(form.cols),
    };

    try {
      if (!payload.name || payload.rows <= 0 || payload.cols <= 0) {
        setMessage('Please provide a hall name and valid rows/cols.');
        return;
      }

      if (editing) {
        await updateHall({ id: editing._id, ...payload }).unwrap();
        setMessage('Hall updated successfully.');
      } else {
        await createHall(payload).unwrap();
        setMessage('Hall created successfully.');
      }
      resetForm();
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to save hall.');
    }
  };

  const onEdit = (hall) => {
    setEditing(hall);
    setForm({ name: hall.name, rows: hall.rows, cols: hall.cols });
    setMessage('');
  };

  const onDelete = async (hall) => {
    if (!window.confirm(`Delete ${hall.name}?`)) return;
    setMessage('');
    try {
      await deleteHall(hall._id).unwrap();
      if (editing?._id === hall._id) resetForm();
      setMessage('Hall deleted successfully.');
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to delete hall.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Hall Administration</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage hall geometry and capacity before generating allocations.
        </p>
        <div className="mt-4 inline-flex rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
          Total Capacity: {totalCapacity}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">{editing ? 'Edit Hall' : 'Create Hall'}</h2>
            {editing ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            ) : null}
          </div>

          <label className="block text-sm text-slate-300">
            Hall Name
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Hall A1"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-slate-300">
              Rows
              <input
                type="number"
                min="1"
                value={form.rows}
                onChange={(e) => setForm((prev) => ({ ...prev, rows: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              Columns
              <input
                type="number"
                min="1"
                value={form.cols}
                onChange={(e) => setForm((prev) => ({ ...prev, cols: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </label>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
            Derived Capacity: <span className="font-semibold text-cyan-300">{Number(form.rows || 0) * Number(form.cols || 0)}</span>
          </div>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {isCreating || isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editing ? 'Update Hall' : 'Create Hall'}
          </button>

          {message ? (
            <p className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">{message}</p>
          ) : null}
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Rows</th>
                <th className="px-4 py-3 font-medium">Cols</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {halls.map((hall) => (
                <tr key={hall._id} className="border-t border-slate-800 text-slate-200">
                  <td className="px-4 py-3">{hall.name}</td>
                  <td className="px-4 py-3">{hall.rows}</td>
                  <td className="px-4 py-3">{hall.cols}</td>
                  <td className="px-4 py-3">{hall.capacity}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(hall)}
                        className="rounded-md border border-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(hall)}
                        disabled={isDeleting}
                        className="rounded-md border border-rose-500/50 px-2 py-1 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {error ? (
            <div className="border-t border-slate-800 p-4 text-sm text-rose-300">
              Failed to load halls: {error?.data?.message || 'Unknown error'}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default HallsAdmin;
