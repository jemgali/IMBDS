import React from 'react'
import { NavLink } from "react-router";
import logo from '../assets/logo.png'

const Header = () => {
  
  const navItems = [
    {  label: "Home", path: "/page/homepage/" },
    // {  label: "Map", path: "/page/interactive-map/" },
    {  label: "Businesses", path: "/page/businesses/" },
    {  label: "Investibles", path: "/page/investibles/" },
    // {  label: "Contact Us", path: "/page/contact/" },
  ];

  return (
    <header className="w-full flex items-center p-4 bg-indigo-600">
      <NavLink to="/page/homepage/" className="flex items-center gap-2">
        <img src={logo} className="h-15" alt="Logo" />
        <div className="flex flex-col gap-1">
          <h2 className="text-md font-bold text-white">Local Economic and Business Development Office</h2>
          <hr className="text-white text-lg w-100" />
          <h2 className="text-sm font-bold text-white  ">Investible Mapping and Business Development System</h2>
        </div>
      </NavLink>
      <div className='flex items-center justify-end w-full'>
        <nav className="flex space-x-8 ml-10">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <button key={index}>
                <NavLink to={item.path} className="gap-3 px-4 py-2 rounded-sm transition-all duration-300 text-white hover:bg-indigo-200 hover:text-indigo-800">
                  <span className="ml-1 font-semibold text-sm">{item.label}</span>
                </NavLink>
              </button>
            ))}
            {/* Map scroll button */}
            <button
              onClick={() => {
                if (window.location.pathname !== '/page/homepage/') {
                  window.location.href = '/page/homepage/';
                  setTimeout(() => window.scrollToMap && window.scrollToMap(), 500);
                } else {
                  window.scrollToMap && window.scrollToMap();
                }
              }}
              className="gap-3 px-4 py-2 rounded-sm transition-all duration-300 text-white hover:bg-indigo-200 hover:text-indigo-800"
            >
              <span className="ml-1 font-semibold text-sm">Map</span>
            </button>
            {/* Contact scroll button (already present) */}
            <button
              onClick={() => {
                if (window.location.pathname !== '/page/homepage/') {
                  window.location.href = '/page/homepage/';
                  setTimeout(() => window.scrollToContact && window.scrollToContact(), 500);
                } else {
                  window.scrollToContact && window.scrollToContact();
                }
              }}
              className="gap-3 px-4 py-2 rounded-sm transition-all duration-300 text-white hover:bg-indigo-200 hover:text-indigo-800"
            >
              <span className="ml-1 font-semibold text-sm">Contact Us</span>
            </button>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header