import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ObservabilityDashboard from './pages/ObservabilityDashboard';
import AgentVisualizer from './pages/AgentVisualizer';
import LiveHeatmap from './pages/LiveHeatmap';
import BlockchainUseCases from './pages/BlockchainUseCases';
import './App.css'; // Make sure this is still imported for global styles

function App() {
  return (
    <Router>
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-content">
          <Routes>
            <Route path="/" element={<ObservabilityDashboard />} />
            <Route path="/visualizer" element={<AgentVisualizer />} />
            <Route path="/heatmap" element={<LiveHeatmap />} />
            <Route path="/blockchain" element={<BlockchainUseCases />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
