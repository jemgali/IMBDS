import { useState, useEffect } from "react";
import { businessIcons, investibleIcon } from "../../assets/icons/icons";

export default function MarkerEditModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues = {},
  onIndustryChange,
  markerToEdit = {}, // Pass the full marker object to detect type
}) {
  // Determine marker type
  const isInvestible = !!markerToEdit.investible || !!markerToEdit.invst;

  // Business fields
  const [label, setLabel] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  // Investible fields
  const [area, setArea] = useState("");
  const [preferredBusiness, setPreferredBusiness] = useState("");
  const [landmark, setLandmark] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [status, setStatus] = useState("available"); // New status field

  // Status options matching Django model
  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "pending", label: "Pending" }
  ];

  useEffect(() => {
    if (isOpen) {
      if (isInvestible) {
        // Investible marker - populate investible fields (FIX FIELD NAMES)
        const investibleData = markerToEdit.investible || markerToEdit.invst;
        setLabel(markerToEdit.label || "");
        setLocation(investibleData?.invst_location || "");
        setArea(investibleData?.area || "");
        setPreferredBusiness(investibleData?.preferred_business || "");
        setLandmark(investibleData?.landmark || "");
        setContactPerson(investibleData?.contact_person || "");
        setContactNumber(investibleData?.contact_number || "");
        setStatus(investibleData?.status || "available"); // Set status from existing data
      } else {
        // Business marker - populate business fields
        setLabel(markerToEdit.label || "");
        setLocation(markerToEdit.business?.bsns_address || "");
        setIndustry(markerToEdit.business?.industry || "");
      }
    }
  }, [isOpen, isInvestible, markerToEdit]);

  useEffect(() => {
    if (typeof onIndustryChange === "function" && !isInvestible) {
      onIndustryChange(industry);
    }
  }, [industry, onIndustryChange, isInvestible]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isInvestible) {
      // Investible submit
      onSubmit({
        markerType: "investible",
        label: label,
        location: location,
        area: area,
        preferred_business: preferredBusiness,
        landmark: landmark,
        contact_person: contactPerson,
        contact_number: contactNumber,
        status: status, // Include status in submission
      });
    } else {
      // Business submit
      onSubmit({
        markerType: "business",
        label: label,
        location: location,
        industry: industry,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-[2px]">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {isInvestible ? "Edit Investible Details" : "Edit Business Details"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Location/Address Field - Common to both */}
          <div className="rounded-xl p-2 shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isInvestible ? "Location Address" : "Business Address"}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 text-black"
              required
            />
          </div>

          {isInvestible ? (
            /* INVESTIBLE SPECIFIC FIELDS */
            <>
              {/* Status Dropdown - New Field */}
              <div className="rounded-xl p-2 shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 text-black"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl p-2 shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqm / ha)</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 text-black"
                />
              </div>

              <div className="rounded-xl p-2 shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Business</label>
                <input
                  type="text"
                  value={preferredBusiness}
                  onChange={(e) => setPreferredBusiness(e.target.value)}
                  className="w-full px-4 text-black"
                />
              </div>

              <div className="rounded-xl p-2 shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 text-black"
                />
              </div>

              <div className="rounded-xl p-2 shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 text-black"
                />
              </div>

              <div className="rounded-xl p-2 shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 text-black"
                />
              </div>

              <div className="flex justify-center">
                <div style={{ width: 44, height: 44 }} aria-hidden icon={investibleIcon} />
              </div>
            </>
          ) : (
            /* BUSINESS SPECIFIC FIELDS */
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
              <div style={{ width: 44, height: 44 }} aria-hidden
                icon={businessIcons[industry] || businessIcons.default} />
            </div>
          )}

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