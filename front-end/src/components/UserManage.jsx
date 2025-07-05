import { useEffect, useState } from "react";
import axios from "axios";
import UserModal from "./Modals/Modal";

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get("http://127.0.0.1:8000/api/user/").then(res => setUsers(res.data));
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    if (editingUser) {
      axios.patch(`http://127.0.0.1:8000/api/user/${editingUser.user_id}/`, formData)
        .then(() => {
          fetchUsers();
          setModalOpen(false);
        })
        .catch((err) => {
          console.error("PATCH error:", err.response?.data || err.message);
          alert("Failed to update user.");
        });
      ;
    } else {
      axios.post("http://127.0.0.1:8000/api/user/", formData).then(() => {
        fetchUsers();
        setModalOpen(false);
      })
        .catch((err) => {
          console.error("Add failed:", err);
          alert("Failed to add user.");
        });
      ;
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.user_id}${user.first_name}${user.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          className="border px-3 py-2 rounded w-1/2"
          placeholder="Search by ID, first or last name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded">
          + Add User
        </button>
      </div>

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
          {filteredUsers.map((user) => (
            <tr key={user.user_id} className="border-b hover:bg-gray-50">
              <td className="p-3">{user.user_id}</td>
              <td className="p-3">{user.username}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.first_name}</td>
              <td className="p-3">{user.last_name}</td>
              <td className="p-3">{user.user_role}</td>
              <td className="p-3">{user.user_status}</td>
              <td className="p-3">
                <button
                  className="px-3 py-1 bg-[#3F5BA9] text-white rounded"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        userData={editingUser}
        mode={editingUser ? "edit" : "add"}
      />
    </div>
  );
}
