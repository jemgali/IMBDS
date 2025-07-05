import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import Contact from './Contact'
import Map from '../MapAPI/Map' // Import your Map component

const SAN_FERNANDO_CITY_API = "https://psgc.cloud/api/cities/0103314000/barangays";

const Homepage = () => {
  const contactRef = useRef(null);
  const mapRef = useRef(null); // Ref for the map section
  const [barangays, setBarangays] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  // Fetch barangays for San Fernando, La Union
  useEffect(() => {
    fetch(SAN_FERNANDO_CITY_API)
      .then(res => res.json())
      .then(data => {
        setBarangays(data);
      })
      .catch(err => {
        console.error("Failed to fetch barangays:", err);
      });
  }, []);

  // Filter barangays as user types
  useEffect(() => {
    if (!search) {
      setFiltered([]); // Do NOT show any dropdown if search is empty
      return;
    }
    setFiltered(
      barangays.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, barangays]);

  // Scroll to contact section
  window.scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to map section
  window.scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start p-8 gap-8">
        {/* Search Section */}
        <div className="w-full max-w-4xl bg-blue-100 p-8 rounded-lg shadow-md">
          <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
            <input
              type="text"
              placeholder="Enter a Barangay"
              className="flex-1 outline-none text-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Only show dropdown if search is not empty and there are matches */}
          {search && filtered.length > 0 && (
            <ul className="bg-white mt-2 rounded shadow max-h-48 overflow-y-auto">
              {filtered.map(b => (
                <li key={b.code} className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                  {b.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-center">
            <button className="px-6 py-2 text-lg bg-green-400 hover:bg-green-500 rounded-lg">SEARCH</button>
          </div>
        </div>

        {/* Map Section */}
        <div ref={mapRef} className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md mt-12">
          <h2 className="text-2xl font-bold mb-4">Interactive Map</h2>
          <div className="w-full h-[400px]">
            <Map />
          </div>
        </div>

        {/* Contact Section */}
        <Contact contactRef={contactRef} />
      </div>
    </Layout>
  )
}

export default Homepage