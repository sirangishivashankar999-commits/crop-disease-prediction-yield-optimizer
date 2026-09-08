import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ModelStatusBanner from './components/ModelStatusBanner';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldOptimizer from './pages/YieldOptimizer';
import FarmInsights from './pages/FarmInsights';
import WeatherPage from './pages/WeatherPage';
import SoilIrrigation from './pages/SoilIrrigation';
import RecommendationsPage from './pages/RecommendationsPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState('Central Valley Farm');
  const [modelStatus, setModelStatus] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cropwise_theme') || 'system';
  });

  useEffect(() => {
    const applyTheme = () => {
      let resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('cropwise_theme', theme);
    };

    applyTheme();

    if (theme === 'system') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      matcher.addEventListener('change', listener);
      return () => matcher.removeEventListener('change', listener);
    }
  }, [theme]);

  const fetchInitialData = async () => {
    try {
      const [statusRes, weatherRes, insightsRes] = await Promise.allSettled([
        api.getModelStatus(),
        api.getWeather(selectedFarm),
        api.getFarmInsights({ location: selectedFarm }),
      ]);

      if (statusRes.status === 'fulfilled') {
        setModelStatus(statusRes.value);
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }

      if (weatherRes.status === 'fulfilled') {
        setWeatherData(weatherRes.value);
      }

      if (insightsRes.status === 'fulfilled') {
        setInsightsData(insightsRes.value);
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 30000); // Polling telemetry every 30s
    return () => clearInterval(interval);
  }, [selectedFarm]);

  return (
    <div className="app-container">
      {/* Responsive Collapsible Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        modelStatus={modelStatus}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Workspace */}
      <div className="main-content">
        <Header
          activeTab={activeTab}
          setIsSidebarOpen={setIsSidebarOpen}
          weatherData={weatherData}
          modelStatus={modelStatus}
          selectedFarm={selectedFarm}
          setSelectedFarm={setSelectedFarm}
          unreadAlertsCount={insightsData?.disease_alerts_active || 3}
        />

        <main className="page-wrapper">
          {/* Real ML Model System Status Banner */}
          <ModelStatusBanner
            modelStatus={modelStatus}
            onRefresh={fetchInitialData}
          />

          {/* Active Tab Page Controller */}
          {activeTab === 'dashboard' && (
            <Dashboard
              insightsData={insightsData}
              weatherData={weatherData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'disease' && (
            <DiseaseDetection modelStatus={modelStatus} />
          )}

          {activeTab === 'yield' && (
            <YieldOptimizer modelStatus={modelStatus} />
          )}

          {activeTab === 'insights' && (
            <FarmInsights insightsData={insightsData} />
          )}

          {activeTab === 'weather' && (
            <WeatherPage weatherData={weatherData} />
          )}

          {activeTab === 'soil' && (
            <SoilIrrigation />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              modelStatus={modelStatus}
              onRefreshStatus={fetchInitialData}
              theme={theme}
              setTheme={setTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
