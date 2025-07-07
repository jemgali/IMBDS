export default function DeleteConfirmModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-[2px] bg-opacity-30">
+      <div className="bg-white p-5 rounded-lg w-80 max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Delete Marker</h2>
        <p className="text-sm text-gray-700 mb-4">
          Are you sure you want to delete this marker? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
