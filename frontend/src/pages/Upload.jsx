import { useState } from 'react';
import { useUploadStudentsMutation } from '../features/apiSlice';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploadStudents, { isLoading, isSuccess, isError }] = useUploadStudentsMutation();
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadStudents(formData).unwrap();
      setMessage(`Success! ${res.insertedCount} records uploaded.`);
      setFile(null);
    } catch (err) {
      setMessage(`Upload failed: ${err?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Data Ingestion</h1>
        <p className="text-slate-400 mt-2">Upload student registry data for seating allocation.</p>
      </div>

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
        <form onSubmit={handleUpload} className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-12 bg-slate-900/50 hover:bg-slate-800/80 transition-colors">
          <UploadCloud className="w-16 h-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Upload Student List</h2>
          <p className="text-slate-400 text-center max-w-md mb-6">
            Supported formats: .txt or .xlsx. Ensure your file contains Roll Number, Name, and Department fields.
          </p>

          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".txt,.xlsx,.xls" 
            onChange={handleFileChange} 
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-slate-600 mb-4"
          >
            {file ? file.name : "Select File"}
          </label>

          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full max-w-xs mt-4 flex justify-center items-center rounded-lg bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Start Processing'}
          </button>
        </form>

        {(isSuccess || message) && (
          <div className={`mt-6 p-4 rounded-lg flex items-center ${isError || message.includes('failed') ? 'bg-red-500/10 border border-red-500/50 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400'}`}>
            {isError || message.includes('failed') ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
            <span className="font-medium whitespace-pre-wrap">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
