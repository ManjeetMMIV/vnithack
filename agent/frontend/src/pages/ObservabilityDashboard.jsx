import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, FileSearch, Users, ActivitySquare, Terminal } from 'lucide-react';
import './ObservabilityDashboard.css';

// Mock Data for charts
const mockActivityData = [
  { time: '10:00', users: 400, verifications: 240 },
  { time: '11:00', users: 300, verifications: 139 },
  { time: '12:00', users: 200, verifications: 980 },
  { time: '13:00', users: 278, verifications: 390 },
  { time: '14:00', users: 189, verifications: 480 },
  { time: '15:00', users: 239, verifications: 380 },
  { time: '16:00', users: 349, verifications: 430 },
];

export default function ObservabilityDashboard() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to Backend API for real-time logs
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('log', (data) => {
      setLogs((prev) => [
        { id: Date.now(), timestamp: new Date().toLocaleTimeString(), ...data },
        ...prev
      ].slice(0, 50)); // Keep last 50 logs
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-page fade-in">
      <header className="page-header">
        <h1>Observability & Telemetry</h1>
        <div className="status-badge">
          <span className={`status-dot ${isConnected ? 'green' : 'red'}`}></span>
          {isConnected ? 'Backend Link Active' : 'Disconnected'}
        </div>
      </header>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue"><Users /></div>
          <div className="metric-content">
            <h3>Active Sessions</h3>
            <div className="metric-value">1,248</div>
            <div className="metric-trend positive">+12% vs last hr</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green"><FileSearch /></div>
          <div className="metric-content">
            <h3>Documents Verified</h3>
            <div className="metric-value">84,392</div>
            <div className="metric-trend positive">Blockchain Synced</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon red"><ShieldAlert /></div>
          <div className="metric-content">
            <h3>Tamper Attempts</h3>
            <div className="metric-value">3</div>
            <div className="metric-trend negative">Require Investigation</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple"><ActivitySquare /></div>
          <div className="metric-content">
            <h3>Agent Throughput</h3>
            <div className="metric-value">4.2s</div>
            <div className="metric-trend">Avg Analysis Time</div>
          </div>
        </div>
      </div>

      <div className="main-panels">
        <div className="chart-panel">
          <h2><Activity className="w-5 h-5" /> System Load & Verification Activity</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerifications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="users" stroke="#38bdf8" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="verifications" stroke="#818cf8" fillOpacity={1} fill="url(#colorVerifications)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="logs-panel">
          <h2><Terminal className="w-5 h-5" /> Live Backend Event Stream</h2>
          <div className="terminal-window">
            {logs.length === 0 ? (
              <div className="empty-logs">Listening for incoming real-time events on port 5000...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="terminal-line">
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className={`log-type type-${log.type.toLowerCase()}`}>[{log.type}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
