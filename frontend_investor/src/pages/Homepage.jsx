import React from 'react'
import Layout from '../components/Layout'
import { FaSearch } from "react-icons/fa"
import map1 from "../assets/sample_map_images/map1.jpg"
import map2 from "../assets/sample_map_images/map2.jpg"
import map3 from "../assets/sample_map_images/map3.png"
import map4 from "../assets/sample_map_images/map4.jpg"
import map5 from "../assets/sample_map_images/map5.jpg"

const barangays = [
  { name: "Catbangen, San Fernando City", img: map1 },
  { name: "Lingsat, San Fernando City", img: map2 },
  { name: "Canaoay, San Fernando City", img: map3 },
  { name: "Dallangayan Oeste, San Fernando City", img: map4 },
  { name: "Biday, San Fernando City", img: map5 },
];

const Homepage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-start p-8 gap-8">

        {/* Search Section */}
        <div className="w-full max-w-4xl bg-blue-100 p-8 rounded-lg shadow-md">
          <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Enter a Barangay"
              className="flex-1 outline-none text-lg"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <button className="px-6 py-2 text-lg bg-green-400 hover:bg-green-500 rounded-lg">SEARCH</button>
          </div>
        </div>

        {/* Recommended Section */}
        <div className="w-full max-w-5xl">
          <h2 className="text-xl font-semibold mb-4">Recommended:</h2>
          <div className="w-full flex items-center gap-4 overflow-x-auto">
            {barangays.map((barangay, index) => (
              <div key={index} className="min-w-[150px] w-[150px] rounded-lg overflow-hidden shadow-md">
                <img src={barangay.img} alt={barangay.name} className="w-full h-[100px] object-cover" />
                <div className="text-sm text-center px-2 py-2">{barangay.name}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default Homepage
