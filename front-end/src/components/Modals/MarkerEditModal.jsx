import { useState, useEffect } from 'react';

export default function MarkerEditModal({ isOpen, onClose, onSubmit, defaultValues = {} }) {
  const [label, setLabel] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');

  // Load initial values when modal is opened
  useEffect(() => {
    if (isOpen) {
      setLabel(defaultValues.label || '');
      setLocation(defaultValues.location || '');
      setIndustry(defaultValues.industry || '');
    }
  }, [defaultValues, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ label, location, industry });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-[2px]">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Business Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 text-black"
              required
            />
          </div>

          {/* Address */}
          <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 text-black"
              required
            />
          </div>

          {/* Industry */}
          <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 text-black"
              required
            >
              <option value="">Select Industry</option>
              <option value="mall">Mall</option>
              <option value="school">School</option>
              <option value="restaurant">Restaurant</option>
              <option value="market">Market</option>
              <option value="hospital">Hospital</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
