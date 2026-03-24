import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DashboardHealth from './pages/DashboardHealth';
import DashboardOverview from './pages/DashboardOverview';
import DataEntry from './pages/DataEntry';
import DataEntryHealth from './pages/DataEntryHealth';
import KPIGroup from './pages/KPIGroup';

// Mock empty pages for routing structure
const Settings = () => <div className="p-4 bg-white rounded-lg shadow-sm"><h2 className="text-xl font-bold text-slate-800">Settings</h2></div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="sdgs" element={<Dashboard categoryFilter="SDGs" />} />
        <Route path="healthkpi" element={<DashboardHealth />} />
        <Route path="entry" element={<DataEntry />} />
        <Route path="entry-health" element={<DataEntryHealth />} />
        <Route path="group/:groupId" element={<KPIGroup />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
