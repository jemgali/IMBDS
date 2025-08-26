// MultipleFiles/ReportPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { useReactToPrint } from 'react-to-print';

const ReportPage = () => {
  const { user, apiClient, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const componentRef = useRef();

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    if (authLoading) {
      return;
    }

    if (!user) {
      console.warn('User not logged in. Redirecting to login.');
      navigate('/login');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('businesses/');
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses for report:', error);
      setFetchError('Failed to load business data for the report. Please try again.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, apiClient, logout, navigate, authLoading]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const generateReportData = () => {
    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter(b => b.status === 'active').length;
    const inactiveBusinesses = businesses.filter(b => b.status === 'inactive').length;
    const pendingBusinesses = businesses.filter(b => b.status === 'pending').length;
    const archivedBusinesses = businesses.filter(b => b.status === 'archived').length;

    const industryDistribution = businesses.reduce((acc, b) => {
      acc[b.industry] = (acc[b.industry] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdownByIndustry = businesses.reduce((acc, b) => {
      if (!acc[b.industry]) {
        acc[b.industry] = { active: 0, inactive: 0, pending: 0, archived: 0 };
      }
      acc[b.industry][b.status] += 1;
      return acc;
    }, {});

    return {
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses,
      pendingBusinesses,
      archivedBusinesses,
      industryDistribution,
      statusBreakdownByIndustry,
    };
  };

  const reportData = generateReportData();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Business_Summary_Report_${new Date().toLocaleDateString()}`,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 text-center">Loading report data...</div>
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

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print/Download Report
          </button>
        </div>

        <div ref={componentRef} className="bg-white p-8 shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Business Summary Report
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Generated on: {new Date().toLocaleDateString()}
          </p>

          {/* I. Business Overview */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">I. Business Overview</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                **Total Businesses:** {reportData.totalBusinesses}
              </li>
              <li>
                **Active Businesses:** {reportData.activeBusinesses} (
                {reportData.totalBusinesses > 0
                  ? ((reportData.activeBusinesses / reportData.totalBusinesses) * 100).toFixed(1)
                  : 0}
                %)
              </li>
              <li>
                **Inactive Businesses:** {reportData.inactiveBusinesses} (
                {reportData.totalBusinesses > 0
                  ? ((reportData.inactiveBusinesses / reportData.totalBusinesses) * 100).toFixed(1)
                  : 0}
                %)
              </li>
              <li>
                **Pending Businesses:** {reportData.pendingBusinesses} (
                {reportData.totalBusinesses > 0
                  ? ((reportData.pendingBusinesses / reportData.totalBusinesses) * 100).toFixed(1)
                  : 0}
                %)
              </li>
              <li>
                **Archived Businesses:** {reportData.archivedBusinesses} (
                {reportData.totalBusinesses > 0
                  ? ((reportData.archivedBusinesses / reportData.totalBusinesses) * 100).toFixed(1)
                  : 0}
                %)
              </li>
            </ul>
          </section>

          {/* II. Business Distribution by Industry */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              II. Business Distribution by Industry
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {Object.entries(reportData.industryDistribution).map(([industry, count]) => (
                <li key={industry}>
                  **{industry.charAt(0).toUpperCase() + industry.slice(1)}:** {count} (
                  {reportData.totalBusinesses > 0
                    ? ((count / reportData.totalBusinesses) * 100).toFixed(1)
                    : 0}
                  %)
                </li>
              ))}
            </ul>
          </section>

          {/* III. Business Status Breakdown */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              III. Business Status Breakdown
            </h2>
            {Object.entries(reportData.statusBreakdownByIndustry).map(([industry, statuses]) => (
              <div key={industry} className="mb-4 pl-4">
                <h3 className="text-xl font-medium mb-2 text-gray-700">
                  **{industry.charAt(0).toUpperCase() + industry.slice(1)}:**
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Active: {statuses.active}</li>
                  <li>Inactive: {statuses.inactive}</li>
                  <li>Pending: {statuses.pending}</li>
                  <li>Archived: {statuses.archived}</li>
                </ul>
              </div>
            ))}
          </section>

          {/* IV. Key Observations */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">IV. Key Observations</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                The "{Object.keys(reportData.industryDistribution).reduce((a, b) =>
                  reportData.industryDistribution[a] > reportData.industryDistribution[b] ? a : b
                ).charAt(0).toUpperCase() + Object.keys(reportData.industryDistribution).reduce((a, b) =>
                  reportData.industryDistribution[a] > reportData.industryDistribution[b] ? a : b
                ).slice(1)}" industry represents the largest sector, accounting for nearly{" "}
                {reportData.totalBusinesses > 0
                  ? (
                      (reportData.industryDistribution[
                        Object.keys(reportData.industryDistribution).reduce((a, b) =>
                          reportData.industryDistribution[a] > reportData.industryDistribution[b] ? a : b
                        )
                      ] /
                        reportData.totalBusinesses) *
                      100
                    ).toFixed(0)
                  : 0}
                % of all businesses.
              </li>
              <li>
                A high percentage of businesses ({reportData.totalBusinesses > 0
                  ? ((reportData.activeBusinesses / reportData.totalBusinesses) * 100).toFixed(0)
                  : 0}
                %) are currently active, indicating a healthy business environment.
              </li>
              <li>
                The number of pending and archived businesses is relatively low, suggesting efficient
                processing and management.
              </li>
            </ul>
          </section>

          {/* V. Recommendations */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">V. Recommendations</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                **Targeted Support:** Develop tailored support programs for industries with a higher
                proportion of inactive businesses to help them reactivate.
              </li>
              <li>
                **Growth Opportunities:** Explore opportunities to further support and expand the
                dominant "{Object.keys(reportData.industryDistribution).reduce((a, b) =>
                  reportData.industryDistribution[a] > reportData.industryDistribution[b] ? a : b
                ).charAt(0).toUpperCase() + Object.keys(reportData.industryDistribution).reduce((a, b) =>
                  reportData.industryDistribution[a] > reportData.industryDistribution[b] ? a : b
                ).slice(1)}" and "
                {Object.keys(reportData.industryDistribution).length > 1
                  ? Object.keys(reportData.industryDistribution).sort((a, b) =>
                      reportData.industryDistribution[b] - reportData.industryDistribution[a]
                    )[1].charAt(0).toUpperCase() + Object.keys(reportData.industryDistribution).sort((a, b) =>
                      reportData.industryDistribution[b] - reportData.industryDistribution[a]
                    )[1].slice(1)
                  : ''}
                " sectors.
              </li>
              <li>
                **Data Granularity:** For future reports, consider including data on business age,
                employee count, and revenue ranges for a more comprehensive analysis.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ReportPage;
