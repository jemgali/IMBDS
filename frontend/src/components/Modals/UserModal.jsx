// MultipleFiles/Modal.jsx
import { useState, useEffect } from 'react'; // Import useEffect

export default function UserModal({ isOpen, onClose, onSubmit, userData, mode, submitError }) { // Add submitError prop
    if (!isOpen) return null;

    const [form, setForm] = useState({
        username: userData?.username || "",
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        email: userData?.email || "",
        password: userData?.password || "",
        user_role: userData?.user_role || "employee",
        user_status: userData?.user_status || "active",
    });

    // Reset form when modal opens or userData changes (for edit mode)
    useEffect(() => {
        setForm({
            username: userData?.username || "",
            first_name: userData?.first_name || "",
            last_name: userData?.last_name || "",
            email: userData?.email || "",
            password: userData?.password || "", // Password should typically not be pre-filled for security
            user_role: userData?.user_role || "employee",
            user_status: userData?.user_status || "active",
        });
    }, [userData, isOpen]); // Depend on userData and isOpen

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[2px] bg-opacity-30">
            <div className="bg-white rounded-lg w-full max-w-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-center">{mode === "edit" ? "Edit User" : "Add User"}</h2>
                {submitError && ( // Display submission error
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{submitError}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            name="username"
                            autoComplete='new-username' // Prevent browser from autofilling with old username
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            name="first_name"
                            type="text"
                            value={form.first_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            name="last_name"
                            type="text"
                            value={form.last_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            name="email"
                            autoComplete='new-email' // Prevent browser from autofilling with old email
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            name="password"
                            autoComplete='new-password' // Prevent browser from autofilling with old password
                            type="password"
                            value={form.password || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required={mode !== "edit"} // require password only when creating
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="user_status"
                            value={form.user_status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                        >
                            <option value="active">Active</option>
                            <option value="archive">Archived</option>
                        </select>
                    </div>

                    <div className="col-span-full flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            {mode === "edit" ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
