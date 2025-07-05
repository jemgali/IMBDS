import React from 'react'
import Layout from '../components/Layout'
import Map from '../MapAPI/Map'

const MapPage = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] w-full">
        <div className="flex items-center justify-center h-[60vh] w-[80vw]">
          <Map />
        </div>
      </div>
    </Layout>
  )
}

export default MapPage