"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";

export default function AuditorDashboard() {
  const [logs, setLogs] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const [properties, setProperties] = useState([]);
  const [auditStatuses, setAuditStatuses] = useState({});

  const fetchProperties = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/records");
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (err) {
      console.error("Failed to fetch properties", err);
    }
  };

  useEffect(() => {
    fetchProperties(); // Initial fetch
    
    // Connect to the Node.js backend
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to Security Command Center");
    });

    socket.on("log", (data) => {
      setLogs((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 logs
      
      // If a new record was created, refresh the table
      if (data.type === "CREATE") {
        fetchProperties();
      }

      if (data.type === "TAMPER_ALERT" || data.type === "HACK") {
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 5000); // Pulse alert for 5 seconds
      }
    });

    return () => socket.disconnect();
  }, []);

  const handleAudit = async (propertyId) => {
    setAuditStatuses(prev => ({ ...prev, [propertyId]: 'auditing' }));
    try {
      const res = await fetch(`http://localhost:5000/api/audit/${propertyId}`);
      if (res.status === 200) {
        setAuditStatuses(prev => ({ ...prev, [propertyId]: 'authentic' }));
      } else if (res.status === 409) {
        setAuditStatuses(prev => ({ ...prev, [propertyId]: 'tampered' }));
      } else {
        setAuditStatuses(prev => ({ ...prev, [propertyId]: 'error' }));
      }
    } catch (err) {
      setAuditStatuses(prev => ({ ...prev, [propertyId]: 'error' }));
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 ${isAlert ? 'bg-red-950' : 'bg-neutral-950'} p-8 font-mono text-neutral-300`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm mb-2 inline-block">← Back to Portal</Link>
            <h1 className="text-3xl font-bold tracking-tighter text-white">
              Security <span className={isAlert ? 'text-red-500' : 'text-emerald-500'}>Command Center</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="http://localhost:5173" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-colors flex items-center gap-2"
            >
              <span>Launch AI Investigator</span>
            </a>
            <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAlert ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isAlert ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-sm font-bold">SYSTEM {isAlert ? 'COMPROMISED' : 'ONLINE'}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Property Table */}
          <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6 h-[75vh] flex flex-col shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>
             <h2 className="text-xl font-semibold mb-6 text-white border-b border-neutral-800 pb-2 relative z-10">
                Land Records Registry
                <button onClick={fetchProperties} className="ml-4 text-xs bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded text-neutral-300 transition-colors">Refresh</button>
             </h2>
             <div className="overflow-y-auto flex-1 relative z-10 pr-2">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-neutral-900 shadow-md z-10 text-neutral-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-2 font-medium">Property ID</th>
                      <th className="py-3 px-2 font-medium">Owner</th>
                      <th className="py-3 px-2 font-medium">Clerk</th>
                      <th className="py-3 px-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {properties.length === 0 ? (
                      <tr><td colSpan="4" className="py-8 text-center text-neutral-500 italic">No records found.</td></tr>
                    ) : (
                      properties.map(prop => (
                        <tr key={prop.propertyId} className="hover:bg-neutral-800/50 transition-colors">
                          <td className="py-3 px-2 font-medium text-neutral-300">{prop.propertyId}</td>
                          <td className="py-3 px-2 text-neutral-400">{prop.owner}</td>
                          <td className="py-3 px-2 text-neutral-500 text-xs">{prop.clerkId}</td>
                          <td className="py-3 px-2 text-right">
                            {auditStatuses[prop.propertyId] === 'authentic' ? (
                                <span className="text-emerald-400 font-bold text-xs bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/30">VERIFIED</span>
                            ) : auditStatuses[prop.propertyId] === 'tampered' ? (
                                <span className="text-red-400 font-bold text-xs bg-red-900/30 px-2 py-1 rounded border border-red-500/30 animate-pulse">TAMPERED</span>
                            ) : auditStatuses[prop.propertyId] === 'auditing' ? (
                                <span className="text-blue-400 font-bold text-xs bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30">CHECKING...</span>
                            ) : (
                                <button 
                                  onClick={() => handleAudit(prop.propertyId)}
                                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold py-1 px-3 rounded transition-colors border border-neutral-700"
                                >
                                  Run Audit
                                </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Live Logs Stream */}
          <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6 h-[75vh] flex flex-col shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-semibold mb-6 text-white border-b border-neutral-800 pb-2 relative z-10 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAlert ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAlert ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              Live Audit Stream
            </h2>
            
            <div className="space-y-4 overflow-y-auto flex-1 relative z-10 pr-2">
              {logs.length === 0 ? (
                <p className="text-neutral-500 italic text-center mt-10">Waiting for network events...</p>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 
                      ${log.type === 'TAMPER_ALERT' || log.type === 'HACK' 
                        ? 'bg-red-900/20 border-red-500/50 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                        : log.type === 'CREATE'
                        ? 'bg-blue-900/20 border-blue-500/30 text-blue-200'
                        : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded tracking-wide
                        ${log.type === 'TAMPER_ALERT' || log.type === 'HACK' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800'}`}>
                        [{log.type}]
                      </span>
                      <span className="text-xs text-neutral-500">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <p className="font-semibold">{log.message}</p>
                    
                    {log.propertyId && (
                      <p className="text-xs mt-2 font-mono text-neutral-400 opacity-80">
                        ID: <span className="text-white">{log.propertyId}</span>
                      </p>
                    )}
                    {log.expectedHash && (
                      <div className="mt-2 p-2 rounded bg-neutral-950/50 space-y-1 text-xs break-all font-mono">
                        <p className="text-emerald-400"><span className="text-neutral-500">Expected:</span> {log.expectedHash}</p>
                        <p className="text-red-400"><span className="text-neutral-500">Actual:</span> {log.actualHash}</p>
                      </div>
                    )}
                    {log.txHash && (
                      <p className="text-[10px] mt-2 font-mono text-blue-400 opacity-80 break-all bg-blue-950/30 p-1.5 rounded">
                        TX: {log.txHash}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
