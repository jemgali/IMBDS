import React from 'react'
import Layout from '../components/Layout'
import Map from '../components/Map'

const MapPage = () => {
  return (
    <Layout>
      <main>
        <section className="container mx-auto px-4 py-8">
          <Map />
        </section>
      </main>
    </Layout>
  )
}

export default MapPage