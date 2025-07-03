import { useState } from 'react';

export default function UserModal({ isOpen, onClose, onSubmit, userData, mode }) {
    if (!isOpen) return null;

    const [form, setForm] = useState({
        username: userData?.username || "",
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        email: userData?.email || "",
        password: userData?.password || "",
        user_role: userData?.user_role || "",
        user_status: userData?.user_status || "offline",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xl p-6">
                <h2 className="text-xl font-semibold mb-6 text-center">{mode === "edit" ? "Edit User" : "Add User"}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full px-4  text-black"
                            required
                        />
                    </div>
                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            name="first_name"
                            type="text"
                            value={form.first_name}
                            onChange={handleChange}
                            className="w-full px-4 text-black"
                            required
                        />
                    </div>
                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            name="last_name"
                            type="text"
                            value={form.last_name}
                            onChange={handleChange}
                            className="w-full px-4 text-black"
                            required
                        />
                    </div>
                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 text-black"
                            required
                        />
                    </div>
                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password || ""}
                            onChange={handleChange}
                            className="w-full px-4 text-black"
                            required={mode !== "edit"} // require password only when creating
                        />
                    </div>

                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="user_role"
                            value={form.user_role}
                            onChange={handleChange}
                            className="w-full px-4 text-black"
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    <div className='rounded-xl p-2 bg-white shadow-[0_-4px_8px_0px_rgba(0,0,0,0.2)]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="user_status"
                            value={form.user_status}
                            onChange={handleChange}
                            className="w-full px-4 text-black"
                            required
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="archive">Archived</option>
                        </select>
                    </div>

                    <div className="col-span-full flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-[#3F5BA9] text-white rounded">
                            {mode === "edit" ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
