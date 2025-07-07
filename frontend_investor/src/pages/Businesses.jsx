// MultipleFiles/Businesses.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api/api_urls'; // Import apiClient

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('businesses/'); // Fetch businesses from the API
      setBusinesses(response.data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p>Loading businesses...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Businesses</h1>
        {businesses.length === 0 ? (
          <p className="text-center text-gray-600">No businesses found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.business_id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-2">{business.bsns_name}</h2>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Address:</span> {business.bsns_address}
                </p>
                <p className="text-gray-700 mb-1 capitalize">
                  <span className="font-medium">Industry:</span> {business.industry}
                </p>
                <p className="text-gray-700 capitalize">
                  <span className="font-medium">Status:</span> {business.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Businesses;
