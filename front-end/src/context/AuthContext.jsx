// MultipleFiles/AuthContext.jsx
import { useState, createContext, useContext, useEffect } from "react";
import { apiClient, API_URLS } from "../api/api_urls"; // Import apiClient and API_URLS

const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // No useEffect for initial token fetch here, as we're not using cookies/localStorage for persistence.
    // The user state will only be set after a successful login.

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
      
        try {
          const response = await apiClient.post('login/', credentials); // Use apiClient
          const { access } = response.data;
      
          // Set the Authorization header for future requests with this apiClient instance
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
          const userResponse = await apiClient.get('protected/'); // Use apiClient for protected route
      
          setUser(userResponse.data.user);
          setLoading(false);
      
          return userResponse.data.user;
        } catch (error) {
          console.error("Login error:", error.response || error.message);
          setError("Invalid credentials");
          setLoading(false);
          // Clear the token from apiClient headers on failed login
          delete apiClient.defaults.headers.common['Authorization'];
          return null;
        }
      };
    
    const logout = () => {
        setUser(null);
        // Clear the token from apiClient headers on logout
        delete apiClient.defaults.headers.common['Authorization'];
        window.location.href = "/login/"; // Redirect to login page
    };

    return (
        <AuthContext.Provider value={{ user, error, loading, login, logout, apiClient }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
