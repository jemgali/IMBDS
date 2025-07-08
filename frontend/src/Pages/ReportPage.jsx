import React, { useState, useEffect, useCallback } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import Layout from '../components/Layout'; // Assuming you have a Layout component
import { useAuth } from '../context/AuthContext'; // To access apiClient and user
import { useNavigate } from 'react-router'; // For redirection

import { BusinessSummaryReport } from './reports/BusinessSummaryReport';
import { BusinessMapReport } from './reports/BusinessMapReport';
import './reports/ReportsPage.css'; // Your existing CSS

const ReportsPage = () => {
  const { user, apiClient, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeReport, setActiveReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    if (authLoading) {
      return; // Wait for authentication to complete
    }

    if (!user) {
      console.warn('User not logged in. Redirecting to login.');
      navigate('/login');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('businesses/');
      // Assuming your API returns business objects with bsns_name, bsns_address, industry, status
      // and that markers API returns latitude, longitude, and links to business_id
      const markersResponse = await apiClient.get('markers/');

      // Map markers to businesses to get location data
      const businessesWithLocations = response.data.map(business => {
        const marker = markersResponse.data.find(m => m.business_id === business.business_id);
        return {
          ...business,
          latitude: marker ? marker.latitude : null,
          longitude: marker ? marker.longitude : null,
        };
      });

      setBusinesses(businessesWithLocations);
    } catch (error) {
      console.error('Error fetching businesses for reports:', error);
      setFetchError('Failed to load business data for reports. Please try again.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout(); // Log out if unauthorized or forbidden
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, authLoading, user, navigate, logout]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const generateReportData = () => {
    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter(b => b.status === 'active').length;
    const inactiveBusinesses = businesses.filter(b => b.status === 'inactive').length;
    const pendingBusinesses = businesses.filter(b => b.status === 'pending').length;
    const archivedBusinesses = businesses.filter(b => b.status === 'archived').length;

    // You can also calculate byIndustry here if needed
    const byIndustry = businesses.reduce((acc, b) => {
      acc[b.industry] = (acc[b.industry] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses,
      pendingBusinesses,
      archivedBusinesses,
      byIndustry,
      businesses: businesses, // Pass the full list of businesses with their location data
    };
  };

  const handleShowReport = (reportType) => {
    setActiveReport(reportType);
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 text-center">Loading business data for reports...</div>
      </Layout>
    );
  }

  if (fetchError) {
    return (
      <Layout>
        <div className="p-6 text-center text-red-600">{fetchError}</div>
      </Layout>
    );
  }

  const reportData = generateReportData();

  return (
    <Layout>
      <div className="reports-container">
        <h1 className="font-bold text-4xl">Business Reports</h1>

        <div className="report-buttons">
          <button
            className="report-button"
            onClick={() => handleShowReport('summary')}
          >
            View Summary Report
          </button>

          <button
            className="report-button"
            onClick={() => handleShowReport('map')}
          >
            View Location Report
          </button>
        </div>

        {showPreview && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {activeReport === 'summary'
                    ? 'Business Summary Report'
                    : 'Business Location Report'}
                </h2>
                <button
                  className="close-button"
                  onClick={() => setShowPreview(false)}
                >
                  ×
                </button>
              </div>

              <div className="pdf-viewer-container">
                <PDFViewer width="100%" height="100%">
                  {activeReport === 'summary' ? (
                    <BusinessSummaryReport data={reportData} />
                  ) : (
                    <BusinessMapReport data={reportData} />
                  )}
                </PDFViewer>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
