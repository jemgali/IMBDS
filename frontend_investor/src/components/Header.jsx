import React from 'react'
import { NavLink } from "react-router";
import logo from '../assets/logo.png'

const Header = () => {
  
  const navItems = [
    {  label: "Map", path: "/page/interactive-map/" },
    {  label: "Businesses", path: "/page/businesses/" },
    {  label: "Investibles", path: "/page/investibles/" },
    {  label: "Contact Us", path: "/page/contact/" },
  ];

  return (
    <div className="w-full flex-shrink-0 bg-indigo-600">
        <header className="relative flex items-center justify-between p-4 ">
            <div className="relative z-10 flex items-center gap-4 px-6">
                <NavLink to="/page/homepage/" className="flex items-center gap-2">
                  <img src={logo} className="h-15 w-auto object-contain" alt="Logo" />
                  <div className="flex flex-col gap-1">
                      <h2 className="text-md font-bold text-white">Local Economic and Business Development Office</h2>
                      <hr className="text-white text-lg w-100" />
                      <h2 className="text-sm font-bold text-white  ">Investible Mapping and Business Development System</h2>
                  </div>
                </NavLink>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {navItems.map((item, index) => (
                      <button key={index}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                              isActive
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'text-white hover:bg-indigo-200 hover:text-indigo-800'
                            }`
                          }
                        >
                          <span className="ml-1 font-semibold text-sm">{item.label}</span>
                        </NavLink>
                      </button>
                    ))}
                  </ul>
                </nav>
            </div>
        </header>
    </div>
  )
}

export default Header