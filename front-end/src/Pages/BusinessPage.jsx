import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import MarkerEditModal from "../components/Modals/MarkerEditModal"; // Re-using the MarkerEditModal for business editing

const BusinessPage = () => {
  const { user, apiClient, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchBusinesses = async () => {
    setIsLoadingBusinesses(true);
    setFetchError(null);

    if (authLoading) {
      return;
    }

    if (!user) {
      console.warn('User not logged in. Redirecting to login.');
      navigate('/login');
      setIsLoadingBusinesses(false);
      return;
    }

    try {
      const response = await apiClient.get('businesses/');
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setFetchError('Failed to load businesses. Please try again.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchBusinesses();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, apiClient, logout, navigate, authLoading]);

  const handleEdit = (businessToEdit) => {
    setEditingBusiness(businessToEdit);
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
      if (editingBusiness) {
        await apiClient.put(`businesses/${editingBusiness.business_id}/`, {
          bsns_name: formData.label,
          bsns_address: formData.location,
          industry: formData.industry,
          status: editingBusiness.status, // Keep existing status or add to form if editable
        });
      }
      fetchBusinesses();
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

  const filteredBusinesses = businesses.filter((b) =>
    `${b.business_id}${b.bsns_name}${b.bsns_address}${b.industry}`
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
            placeholder="Search by ID, name, address, or industry"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Add Business button is removed as businesses are created via markers */}
        </div>

        {isLoadingBusinesses ? (
          <div className="text-center py-4">Loading businesses...</div>
        ) : fetchError ? (
          <div className="text-center py-4 text-red-600">{fetchError}</div>
        ) : (
          <table className="w-full text-sm border-collapse bg-white shadow">
            <thead className="bg-[#3F5BA9] text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Industry</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((b) => (
                <tr key={b.business_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{b.business_id}</td>
                  <td className="p-3">{b.bsns_name}</td>
                  <td className="p-3">{b.bsns_address}</td>
                  <td className="p-3 capitalize">{b.industry}</td>
                  <td className="p-3 capitalize">{b.status}</td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 bg-[#3F5BA9] text-white rounded"
                      onClick={() => handleEdit(b)}
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
            defaultValues={{
              label: editingBusiness?.bsns_name || '',
              location: editingBusiness?.bsns_address || '',
              industry: editingBusiness?.industry || '',
            }}
            submitError={submitError} // Pass submitError to the modal
          />
        )}
      </div>
    </Layout>
  );
};

export default BusinessPage;
