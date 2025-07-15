import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, HomeIcon, UserIcon, Cog6ToothIcon, MapIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`h-full bg-[#3F5BA9] text-white transition-all duration-300 shadow-lg  ${collapsed ? "w-16" : "w-50"}`}>
      {/* Burger Toggle Button */}
      <div className="flex justify-end px-5.5 pt-4">
        <button onClick={() => setCollapsed(!collapsed)} className="text-white">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar items */}
      <ul className="space-y-2 mt-4">
        {/* <SidebarItem to="/Dashboard" icon={<HomeIcon className="h-6 w-6" />} label="Dashboard" collapsed={collapsed} /> */}
        <SidebarItem to="/Map" icon={<MapIcon className="h-6 w-6" />} label="Interactive Map" collapsed={collapsed} />
        {/* <SidebarItem to="/Investibles" icon={<UserIcon className="h-6 w-6" />} label="Investibles" collapsed={collapsed} /> */}
        <SidebarItem to="/UserManage" icon={<UserIcon className="h-6 w-6" />} label="User Management" collapsed={collapsed} />
      </ul>
    </div>
  );
}

// ✅ FIXED SidebarItem
function SidebarItem({ to, icon, label, collapsed }) {
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
}
