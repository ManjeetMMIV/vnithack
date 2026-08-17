import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Map, ShieldCheck, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/nagpur-police-logo.jpg" alt="Logo" className="sidebar-logo" />
        <h2>NAGAR Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Observability</span>
        </NavLink>
        <NavLink to="/visualizer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Network className="w-5 h-5" />
          <span>Agent Investigation</span>
        </NavLink>
        <NavLink to="/heatmap" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Map className="w-5 h-5" />
          <span>Live Heatmap</span>
        </NavLink>
        <NavLink to="/blockchain" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ShieldCheck className="w-5 h-5" />
          <span>Trust Layer</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-link disabled">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}
