export default function DeleteWarningModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-semibold mb-4">Delete Mode Warning</h2>
        <p className="text-sm text-gray-700 mb-4">
          You are about to enter delete mode. In this mode, clicking on markers or
          shapes will permanently delete them. Proceed with caution.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
          >
            Enter Delete Mode
          </button>
        </div>
      </div>
    </div>
  );
}
