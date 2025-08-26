// MultipleFiles/UserPage.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import UserModal from "../components/Modals/UserModal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const UserPage = () => {
  const { user, apiClient, logout, loading: authLoading } = useAuth(); // Get authLoading
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setFetchError(null);

    // Wait for authLoading to be false before proceeding
    if (authLoading) {
      return;
    }

    if (!user) {
      console.warn('User not logged in. Redirecting to login.');
      navigate('/login');
      setIsLoadingUsers(false);
      return;
    }

    try {
      const response = await apiClient.get('users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setFetchError('Failed to load users. Please try again.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // If 401 (Unauthorized) or 403 (Forbidden), log out the user
        logout();
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Only fetch users if authentication is not in progress and user is available
    if (!authLoading && user) {
      fetchUsers();
    } else if (!authLoading && !user) {
      // If not loading auth and no user, redirect to login
      navigate('/login');
    }
  }, [user, apiClient, logout, navigate, authLoading]); // Added authLoading to dependencies

  const handleAdd = () => {
    setEditingUser(null);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
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
      if (editingUser) {
        await apiClient.patch(`users/update/${editingUser.id}/`, formData); // Use update endpoint
      } else {
        await apiClient.post("users/create/", formData); // Use create endpoint
      }
      fetchUsers();
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
          // Attempt to stringify complex error objects or extract specific messages
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

  const filteredUsers = users.filter((u) =>
    `${u.id}${u.first_name}${u.last_name}`
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
            placeholder="Search by ID, first or last name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 hover:bg-[#5C9A5C] text-white bg-green-700 rounded"
          >
            + Add User
          </button>
        </div>

        {isLoadingUsers ? (
          <div className="text-center py-4">Loading users...</div>
        ) : fetchError ? (
          <div className="text-center py-4 text-red-600">{fetchError}</div>
        ) : (
          <table className="w-full text-sm border-collapse bg-white shadow">
            <thead className="bg-[#3F5BA9] text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Firstname</th>
                <th className="p-3">Lastname</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.first_name}</td>
                  <td className="p-3">{u.last_name}</td>
                  <td className="p-3">{u.user_role}</td>
                  <td className="p-3">{u.user_status}</td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 bg-[#3F5BA9] text-white rounded"
                      onClick={() => handleEdit(u)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <UserModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSubmitError(null);
          }}
          onSubmit={handleModalSubmit}
          userData={editingUser}
          mode={editingUser ? "edit" : "add"}
          submitError={submitError}
        />
      </div>
    </Layout>
  );
};

export default UserPage;
