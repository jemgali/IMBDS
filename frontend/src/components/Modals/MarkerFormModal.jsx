import { useState } from 'react';

export default function MarkerFormModal({ isOpen, onSubmit, onClose }) {
  const [label, setLabel] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [confirming, setConfirming] = useState(false);

  const resetForm = () => {
    setLabel('');
    setLocation('');
    setIndustry('');
    setConfirming(false);
  };

  const handleFinalSubmit = () => {
    onSubmit({ label, location, industry });
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-md w-96">
        {!confirming ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Marker Details</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirming(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="mall">Mall</option>
                  <option value="school">School</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="market">Market</option>
                  <option value="hospital">Hospital</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Confirm Marker Details</h2>
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              <p><strong>Name:</strong> {label}</p>
              <p><strong>Address:</strong> {location}</p>
              <p><strong>Industry:</strong> {industry}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Confirm & Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
