import { useState } from 'react';

export default function MarkerFormModal({ isOpen, onSubmit, onClose }) {
  const [label, setLabel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ label });
    setLabel('');
    onClose();
  };

  if (!isOpen) return null; // ✅ Only render if open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">Marker Details</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Label
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-2 mt-1 border rounded border-gray-300"
              required
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setLabel('');
                onClose();
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
