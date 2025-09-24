// components/Modals/MarkerFormModal.jsx
import { useState, useEffect } from "react";
import { businessIcons, investibleIcon } from "../../assets/icons/icons";

export default function MarkerFormModal({
  isOpen,
  markerType = "business", // "business" | "investible"
  onSubmit,
  onBack, // 🔹 new prop: go back to SelectionModal
  onClose,
  onIndustryChange,
  initialIndustry = "",
}) {
  const [confirming, setConfirming] = useState(false);

  // --- Business fields ---
  const [label, setLabel] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState(initialIndustry);

  // --- Investible fields ---
  const [invLocation, setInvLocation] = useState("");
  const [area, setArea] = useState("");
  const [preferredBusiness, setPreferredBusiness] = useState("");
  const [landmark, setLandmark] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
    setIndustry(initialIndustry || "");
  }, [initialIndustry]);

  const resetForm = () => {
    setLabel("");
    setLocation("");
    setIndustry("");
    setInvLocation("");
    setArea("");
    setPreferredBusiness("");
    setLandmark("");
    setContactPerson("");
    setContactNumber("");
    setConfirming(false);
  };

  const handleFinalSubmit = () => {
    const payload =
      markerType === "business"
        ? { markerType, label, location, industry }
        : {
            markerType,
            location: invLocation,
            area,
            preferred_business: preferredBusiness,
            landmark,
            contact_person: contactPerson,
            contact_number: contactNumber,
          };

    if (typeof onSubmit === "function") onSubmit(payload);

    resetForm();
    if (typeof onClose === "function") onClose();
  };

  // 🔹 Back goes to SelectionModal instead of closing everything
  const handleBackToSelection = () => {
    resetForm();
    if (typeof onBack === "function") onBack();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-[2px]">
      <div className="bg-white p-6 rounded shadow-md w-96">
        {!confirming ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              {markerType === "business"
                ? "Business Marker Details"
                : "Investible Marker Details"}
            </h2>

            {/* -------- BUSINESS FORM -------- */}
            {markerType === "business" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConfirming(true);
                }}
                className="space-y-4"
              >
                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Trade Name
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 text-black"
                    required
                  />
                </div>

                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 text-black"
                    required
                  />
                </div>

                <div className="rounded-xl p-2 shadow flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Business Line
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        if (onIndustryChange)
                          onIndustryChange(e.target.value);
                      }}
                      className="w-full px-4 text-black"
                      required
                    >
                      <option value="">Select Business Line</option>
                      <option value="mall">Mall</option>
                      <option value="school">School</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="market">Market</option>
                      <option value="hospital">Hospital</option>
                      <option value="office">Office</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {/* ✅ Business icon preview */}
                  <div
                    style={{ width: 44, height: 44 }}
                    aria-hidden
                    icon={businessIcons[industry] || businessIcons.default}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleBackToSelection}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              /* -------- INVESTIBLE FORM -------- */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConfirming(true);
                }}
                className="space-y-4"
              >
                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={invLocation}
                    onChange={(e) => setInvLocation(e.target.value)}
                    className="w-full px-4 text-black"
                    required
                  />
                </div>

                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Area (sqm / ha)
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 text-black"
                  />
                </div>

                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Preferred Business
                  </label>
                  <input
                    type="text"
                    value={preferredBusiness}
                    onChange={(e) => setPreferredBusiness(e.target.value)}
                    className="w-full px-4 text-black"
                  />
                </div>

                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 text-black"
                  />
                </div>

                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-4 text-black"
                  />
                </div>

                <div className="rounded-xl p-2 shadow">
                  <label className="block text-sm font-medium mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 text-black"
                  />
                </div>

                {/* ✅ Investible icon preview */}
                <div
                  style={{ width: 44, height: 44 }}
                  aria-hidden
                  icon={investibleIcon}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleBackToSelection}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          // Confirm screen
          <>
            <h2 className="text-lg font-semibold mb-4">
              Confirm Marker Details
            </h2>
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              {markerType === "business" ? (
                <>
                  <p>
                    <strong>Trade Name:</strong> {label}
                  </p>
                  <p>
                    <strong>Address:</strong> {location}
                  </p>
                  <p>
                    <strong>Business Line:</strong> {industry}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Location:</strong> {invLocation}
                  </p>
                  <p>
                    <strong>Area:</strong> {area}
                  </p>
                  <p>
                    <strong>Preferred Business:</strong> {preferredBusiness}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {landmark}
                  </p>
                  <p>
                    <strong>Contact Person:</strong> {contactPerson}
                  </p>
                  <p>
                    <strong>Contact Number:</strong> {contactNumber}
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
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
