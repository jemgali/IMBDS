import { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../api/api_urls";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getCookie("access_token"); // Retrieve token from cookies
                if (!token) {
                    console.error("No access token found");
                    setUser(null);
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get(`${ API_URLS }protected/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Fetched user on app load:", response.data.user); // Debugging
                setUser(response.data.user);
            } catch (err) {
                console.error("Error fetching user:", err);
                setUser(null);
            } finally {
                setLoading(false); // Ensure loading is set to false
            }
        };
    
        fetchUser();
    }, []);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
      
        try {
          console.log("Sending login request with:", credentials); // Debugging
          const response = await axios.post(`${API_URLS}login/`, credentials, {
            withCredentials: true,
          });
          console.log("Login response:", response.data); // Debugging
      
          const { access } = response.data;
      
          document.cookie = `access_token=${access}; path=/;`;
      
          const userResponse = await axios.get(`${API_URLS}protected/`, {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          });
      
          console.log("Fetched user after login:", userResponse.data.user); // Debugging
          setUser(userResponse.data.user);
          setLoading(false);
      
          return userResponse.data.user;
        } catch (error) {
          console.error("Login error:", error.response || error.message);
          setError("Invalid credentials");
          setLoading(false);
          return null;
        }
      };
    
    const logout = () => {
        setUser(null);
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/login/";
    };

    return (
        <AuthContext.Provider value={{ user, error, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);