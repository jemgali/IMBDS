import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import MarkerEditModal from "../components/Modals/MarkerEditModal";

const InvestiblePage = () => {
  const { user, apiClient, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investibles, setInvestibles] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestible, setEditingInvestible] = useState(null);
  const [isLoadingInvestibles, setIsLoadingInvestibles] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchInvestibles = async () => {
    setIsLoadingInvestibles(true);
    setFetchError(null);

    if (authLoading) {
      return;
    }

    if (!user) {
      console.warn('User not logged in. Redirecting to login.');
      navigate('/login');
      setIsLoadingInvestibles(false);
      return;
    }

    try {
      const response = await apiClient.get('investibles/');
      setInvestibles(response.data);
    } catch (error) {
      console.error('Error fetching investibles:', error);
      setFetchError('Failed to load investibles. Please try again.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    } finally {
      setIsLoadingInvestibles(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchInvestibles();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, apiClient, logout, navigate, authLoading]);

  const handleEdit = (investibleToEdit) => {
    setEditingInvestible(investibleToEdit);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (!user) {
      console.error('Cannot submit: User not logged in.');
      navigate('/login');
      return;
    }

    setSubmitError(null);

    try {
      if (editingInvestible) {
        await apiClient.put(`investibles/${editingInvestible.investible_id}/`, {
          invst_location: formData.location,
          invst_description: formData.preferred_business || 'Investible property',
          area: formData.area,
          preferred_business: formData.preferred_business,
          landmark: formData.landmark,
          contact_person: formData.contact_person,
          contact_number: formData.contact_number,
          status: formData.status || 'available',
        });
      }
      fetchInvestibles();
      setModalOpen(false);
    } catch (err) {
      console.error("Submission failed:", err);
      let errorMessage = "Failed to perform action. Please try again.";

      if (err.response) {
        if (err.response.status === 405) {
          errorMessage = "Action not allowed for this resource. (Method Not Allowed)";
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Authentication failed. Please log in again.";
          logout();
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data) {
          if (typeof err.response.data === 'object') {
            errorMessage = Object.values(err.response.data).flat().join(', ');
          } else {
            errorMessage = err.response.data;
          }
        }
      }
      setSubmitError(errorMessage);
    }
  };

  const filteredInvestibles = investibles.filter((inv) =>
    `${inv.investible_id}${inv.invst_location}${inv.area}${inv.preferred_business}${inv.landmark}${inv.contact_person}${inv.contact_number}${inv.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            className="border px-3 py-2 rounded w-1/2"
            placeholder="Search by ID, location, area, preferred business, landmark, contact, or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoadingInvestibles ? (
          <div className="text-center py-4">Loading investibles...</div>
        ) : fetchError ? (
          <div className="text-center py-4 text-red-600">{fetchError}</div>
        ) : (
          <table className="w-full text-sm border-collapse bg-white shadow">
            <thead className="bg-[#3F5BA9] text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Location</th>
                <th className="p-3">Area</th>
                <th className="p-3">Preferred Business</th>
                <th className="p-3">Landmark</th>
                <th className="p-3">Contact Person</th>
                <th className="p-3">Contact Number</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestibles.map((inv) => (
                <tr key={inv.investible_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{inv.investible_id}</td>
                  <td className="p-3">{inv.invst_location}</td>
                  <td className="p-3">{inv.area}</td>
                  <td className="p-3">{inv.preferred_business}</td>
                  <td className="p-3">{inv.landmark}</td>
                  <td className="p-3">{inv.contact_person}</td>
                  <td className="p-3">{inv.contact_number}</td>
                  <td className="p-3 capitalize">{inv.status}</td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 bg-[#3F5BA9] text-white rounded"
                      onClick={() => handleEdit(inv)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {modalOpen && (
          <MarkerEditModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSubmitError(null);
            }}
            onSubmit={handleModalSubmit}
            markerToEdit={{
              // Structure it like the map version
              investible: editingInvestible,
              label: editingInvestible?.invst_location || '', // Use invst_location as label
              latitude: 0, // Add dummy values since they're required but not used
              longitude: 0,
            }}
            submitError={submitError}
          />
        )}
      </div>
    </Layout>
  );
};

export default InvestiblePage;