// MultipleFiles/DashPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

const DashPage = () => {
  const { user, apiClient, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    inactiveBusinesses: 0,
    pendingBusinesses: 0,
    archivedBusinesses: 0,
    totalInvestibles: 0,
    availableInvestibles: 0,
    soldInvestibles: 0,
    pendingInvestibles: 0,
    totalMarkers: 0,
    totalReports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
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
      // Fetch Users
      const usersResponse = await apiClient.get('users/');
      const totalUsers = usersResponse.data.length;

      // Fetch Businesses
      const businessesResponse = await apiClient.get('businesses/');
      const totalBusinesses = businessesResponse.data.length;
      const activeBusinesses = businessesResponse.data.filter(b => b.status === 'active').length;
      const inactiveBusinesses = businessesResponse.data.filter(b => b.status === 'inactive').length;
      const pendingBusinesses = businessesResponse.data.filter(b => b.status === 'pending').length;
      const archivedBusinesses = businessesResponse.data.filter(b => b.status === 'archived').length;

      // Fetch Investibles
      const investiblesResponse = await apiClient.get('investibles/');
      const totalInvestibles = investiblesResponse.data.length;
      const availableInvestibles = investiblesResponse.data.filter(i => i.status === 'available').length;
      const soldInvestibles = investiblesResponse.data.filter(i => i.status === 'sold').length;
      const pendingInvestibles = investiblesResponse.data.filter(i => i.status === 'pending').length;

      // Fetch Markers
      const markersResponse = await apiClient.get('markers/');
      const totalMarkers = markersResponse.data.length;

      // Fetch Reports
      const reportsResponse = await apiClient.get('reports/');
      const totalReports = reportsResponse.data.length;

      setDashboardData({
        totalUsers,
        totalBusinesses,
        activeBusinesses,
        inactiveBusinesses,
        pendingBusinesses,
        archivedBusinesses,
        totalInvestibles,
        availableInvestibles,
        soldInvestibles,
        pendingInvestibles,
        totalMarkers,
        totalReports,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setFetchError('Failed to load dashboard data. Please try again.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, apiClient, logout, navigate, authLoading]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 text-center">Loading dashboard data...</div>
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
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Users</h2>
            <p className="text-4xl font-bold text-blue-600">{dashboardData.totalUsers}</p>
            <p className="text-gray-500">Total Registered Users</p>
          </div>

          {/* Businesses Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Businesses</h2>
            <p className="text-4xl font-bold text-green-600">{dashboardData.totalBusinesses}</p>
            <p className="text-gray-500 mb-2">Total Businesses Registered</p>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>Active: <span className="font-medium">{dashboardData.activeBusinesses}</span></li>
              <li>Inactive: <span className="font-medium">{dashboardData.inactiveBusinesses}</span></li>
              <li>Pending: <span className="font-medium">{dashboardData.pendingBusinesses}</span></li>
              <li>Archived: <span className="font-medium">{dashboardData.archivedBusinesses}</span></li>
            </ul>
          </div>

          {/* Investibles Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Investibles</h2>
            <p className="text-4xl font-bold text-purple-600">{dashboardData.totalInvestibles}</p>
            <p className="text-gray-500 mb-2">Total Investible Properties</p>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>Available: <span className="font-medium">{dashboardData.availableInvestibles}</span></li>
              <li>Sold: <span className="font-medium">{dashboardData.soldInvestibles}</span></li>
              <li>Pending: <span className="font-medium">{dashboardData.pendingInvestibles}</span></li>
            </ul>
          </div>

          {/* Markers Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Map Markers</h2>
            <p className="text-4xl font-bold text-red-600">{dashboardData.totalMarkers}</p>
            <p className="text-gray-500">Total Markers on Map</p>
          </div>

          {/* Reports Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Reports</h2>
            <p className="text-4xl font-bold text-yellow-600">{dashboardData.totalReports}</p>
            <p className="text-gray-500">Total Generated Reports</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashPage;
