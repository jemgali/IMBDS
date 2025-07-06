import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router";

const Header = ({ showProfile = true }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  // Helper for dropdown position
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const profileRef = React.useRef();

  const handleProfileClick = (e) => {
    const rect = profileRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.right - 160 + window.scrollX });
    toggleDropdown();
  };

  return (
    <div className="w-full flex-shrink-0 bg-[rgb(63,91,169)]">
      <header className="relative flex items-center justify-between p-4 shadow-md">
        <div className="relative z-10 flex items-center gap-4 px-6">
          <img src={Logo} className="h-15 w-auto object-contain" alt="Logo" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">
              Local Economic and Business Development Office
            </h2>
            <hr className="text-white text-2xl w-145" />
            <h2 className="text-xl font-bold text-white">
              Investible Mapping and Business Development System
            </h2>
          </div>
        </div>
        {/* Profile Dropdown */}
        {showProfile && (
          <div className="relative z-10">
            <div
              ref={profileRef}
              className="flex items-center cursor-pointer select-none"
              onClick={handleProfileClick}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user ? user.username : "User"}`}
                alt="User Profile"
                className="h-10 w-10 rounded-full border border-gray-300"
              />
              <span className="ml-3 text-white font-medium">
                {user ? user.username : "Guest"}
              </span>
            </div>
            {isDropdownOpen &&
              createPortal(
                <div
                  className="fixed w-40 bg-white border border-gray-200 rounded shadow-lg z-[9999]"
                  style={{
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                  }}
                >
                  <ul>
                    {user ? (
                      <>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={handleLogout}
                        >
                          Logout
                        </li>
                      </>
                    ) : (
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate("/login")}
                      >
                        Login
                      </li>
                    )}
                  </ul>
                </div>,
                document.body
              )}
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;