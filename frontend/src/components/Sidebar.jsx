import React, { useState } from 'react'
import { Link, useLocation } from "react-router";
import { Bars3Icon, HomeIcon, UserIcon, Cog6ToothIcon, MapIcon } from "@heroicons/react/24/outline";

// SidebarItem as a separate component
const SidebarItem = ({ to, icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to}>
      <li
        className={`flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer ${
          isActive ? "bg-blue-900" : "hover:bg-blue-800"
        }`}
      >
        {icon}
        {!collapsed && <span className="text-sm">{label}</span>}
      </li>
    </Link>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`h-full bg-[#3F5BA9] text-white transition-all duration-100 shadow-lg ${collapsed ? "w-16" : "w-60"}`}>
      <div className="flex justify-end px-6 pt-4">
        <button onClick={() => setCollapsed(!collapsed)} className="text-white">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      <ul className="space-y-2 mt-4">
        <SidebarItem to="/admin/Dashboard" icon={<HomeIcon className="h-6 w-6" />} label="Dashboard" collapsed={collapsed} />
        <SidebarItem to="/admin/Map" icon={<MapIcon className="h-6 w-6" />} label="Interactive Map" collapsed={collapsed} />
        <SidebarItem to="/admin/Business" icon={<Cog6ToothIcon className="h-6 w-6" />} label="Business Management" collapsed={collapsed} />
        <SidebarItem to="/admin/Investible" icon={<Cog6ToothIcon className="h-6 w-6" />} label="Investible Management" collapsed={collapsed} />
        <SidebarItem to="/admin/User" icon={<UserIcon className="h-6 w-6" />} label="User Management" collapsed={collapsed} />
        <SidebarItem to="/admin/Reports" icon={<Cog6ToothIcon className="h-6 w-6" />} label="Generate Reports" collapsed={collapsed} />
      </ul>
    </div>
  );
};

export default Sidebar;