import { useState } from "react";

const sampleUsers = [
  { id: 1, username: "jdoe", firstname: "John", lastname: "Doe", role: "Admin", status: "Active" },
  { id: 2, username: "asmith", firstname: "Alice", lastname: "Smith", role: "Manager", status: "Inactive" },
  { id: 3, username: "bjones", firstname: "Bob", lastname: "Jones", role: "Staff", status: "Active" },
];

export default function UserManage() {
  const [search, setSearch] = useState("");

  const filteredUsers = sampleUsers.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      user.id.toString().includes(keyword) ||
      user.firstname.toLowerCase().includes(keyword) ||
      user.lastname.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-4 bg-[#EDF1FA] h-screen">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      <input
        type="text"
        placeholder="Search by ID, Firstname, or Lastname"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded-md w-full md:w-1/2"
      />

      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-[#3F5BA9] text-white text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">Firstname</th>
              <th className="p-3">Lastname</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.firstname}</td>
                <td className="p-3">{user.lastname}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-white text-sm ${user.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
