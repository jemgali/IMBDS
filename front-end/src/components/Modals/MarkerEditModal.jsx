// components/Modals/MarkerEditModal.jsx
import { useState, useEffect } from "react";
import { businessIcons } from "../../assets/icons/icons";

export default function MarkerEditModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues = {},
  onIndustryChange,
}) {
  const [label, setLabel] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLabel(defaultValues.label || "");
      setLocation(defaultValues.location || "");
      setIndustry(defaultValues.industry || "");
    }
  }, [defaultValues, isOpen]);

  useEffect(() => {
    if (typeof onIndustryChange === "function") {
      onIndustryChange(industry);
    }
  }, [industry, onIndustryChange]);

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
          <div className="rounded-xl p-2 shadow">
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
          <div className="rounded-xl p-2 shadow">
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
          <div className="rounded-xl p-2 shadow flex items-center gap-3">
            <div className="flex-1">
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

            {/* Icon preview */}
            <div style={{ width: 44, height: 44 }} aria-hidden
                 icon={businessIcons[industry] || businessIcons.default} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
