// MultipleFiles/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from '../context/AuthContext'
import Header from "../components/Header";
import Footer from "../components/Footer";

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, error } = useAuth() // 'error' from AuthContext will now be set for login failures
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting login form with:", { username, password });

    const loggedInUser = await login({ username, password }); // Get the user object from the login function

    if (loggedInUser) { // Check if login was successful (user object is not null)
        if (loggedInUser.user_role === "Admin") {
            console.log("Redirecting to /admin/Dashboard");
            navigate("/admin/Dashboard");
        } else if (loggedInUser.user_role === "Employee") { // Ensure case matches backend ('employee' vs 'Employee')
            console.log("Redirecting to /employee/Dashboard");
            navigate("/employee/Dashboard");      
        }
    } else {
        console.error("Login failed or user object is null (AuthContext error should be set)");
        // The error state in AuthContext will handle displaying the message
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#EDF1FA]">
      <Header showProfile={false} />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="h-full w-full bg-[#EDF1FA] flex flex-col items-center justify-center">
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
            {error && ( // Display error message from AuthContext
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Login Failed: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="rounded-xl p-2 bg-white shadow-[0_-2px_8px_0px_rgba(0,0,0,0.2)]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username:
              </label>
              <input
                type="text"
                autoComplete="username"
                className="w-full px-4 font-bold text-black text-lg focus:outline-none"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="rounded-xl p-2 bg-white shadow-[0_-2px_8px_0px_rgba(0,0,0,0.2)]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password:
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full px-4 text-black text-lg focus:outline-none"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#3F5BA9] text-white font-semibold py-3 rounded-xl shadow-md hover:bg-[#334a86] transition-all duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
