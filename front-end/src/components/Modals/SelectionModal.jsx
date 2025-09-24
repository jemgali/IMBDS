import React from "react";

export default function SelectionModal({
  isOpen,
  onCancel,
  onBusinessSelect,
  onInvestibleSelect,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-[2px]">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">Create Marker</h2>
        <p className="text-sm text-gray-700 mb-4">
          Choose the marker type to create.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onBusinessSelect}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            Business Marker
          </button>

          <button
            onClick={onInvestibleSelect}
            className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Investible Marker
          </button>

          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm text-gray-600 mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
