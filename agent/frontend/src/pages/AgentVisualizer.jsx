import { useState, useRef, useEffect, useMemo } from 'react';
import '../App.css';
import GraphVisualizer from '../GraphVisualizer';
import PoliceDossier from '../PoliceDossier';

const RECENT_ALERTS = [
  { time: '1 min ago', text: 'Automated land registry integrity sweep initialized', severity: 'low' },
  { time: '4 min ago', text: 'Circular ownership loop flagged on CLK-042', severity: 'high' },
  { time: '12 min ago', text: 'Shell company director link detected on CLK-017', severity: 'high' },
  { time: '25 min ago', text: 'Duplicate survey collision identified on CLK-089', severity: 'high' },
  { time: '1 hr ago', text: 'Circle rate evasion audit triggered on CLK-023', severity: 'medium' },
  { time: '2 hr ago', text: 'Clean record clearance verified for CLK-008', severity: 'low' },
];

function App() {
  const [clerks, setClerks] = useState([]);
  const [loadingClerks, setLoadingClerks] = useState(true);
  const [activeClerk, setActiveClerk] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [analyzedClerks, setAnalyzedClerks] = useState(new Set());
  const [latestReport, setLatestReport] = useState(null);
  const [reportsMap, setReportsMap] = useState({});

  const terminalRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 1. Fetch dynamic clerk profiles from Neo4j Aura backend
  useEffect(() => {
    fetch('/api/clerks')
      .then(res => res.json())
      .then(data => {
        setClerks(data);
        setLoadingClerks(false);
      })
      .catch(err => {
        console.error('Failed to load clerks:', err);
        setLoadingClerks(false);
      });
  }, []);

  // 2. Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // 3. Dynamic Stats derived from analyzed clerks
  const totalProperties = clerks.reduce((sum, c) => sum + (c.properties || 0), 0);

  const stats = useMemo(() => {
    const analyzedList = clerks.filter(c => analyzedClerks.has(c.id));
    const scannedProps = analyzedList.reduce((sum, c) => sum + (c.properties || 0), 0);
    const flaggedClerksCount = analyzedList.filter(c => c.risk === 'Critical' || c.risk === 'High' || c.risk === 'Medium').length;
    
    let totalTamperAlerts = 0;
    Object.values(reportsMap).forEach(r => {
      if (r.status !== 'CLEAN' && r.status !== 'CLEAN_RECORD') {
        totalTamperAlerts += (r.linkedProperties ? r.linkedProperties.length : 1);
      }
    });

    const integrity = totalProperties > 0
      ? (((totalProperties - totalTamperAlerts) / totalProperties) * 100).toFixed(1)
      : '100.0';

    return [
      { label: 'Properties Scanned', value: `${scannedProps} / ${totalProperties}`, color: '#6c5ce7' },
      { label: 'Tamper Alerts', value: String(totalTamperAlerts), color: totalTamperAlerts > 0 ? '#d63031' : '#636e72' },
      { label: 'Clerks Flagged', value: `${flaggedClerksCount} / ${analyzedClerks.size}`, color: flaggedClerksCount > 0 ? '#e17055' : '#636e72' },
      { label: 'Integrity Score', value: `${integrity}%`, color: parseFloat(integrity) >= 90 ? '#00b894' : parseFloat(integrity) >= 75 ? '#e17055' : '#d63031' },
    ];
  }, [clerks, analyzedClerks, reportsMap, totalProperties]);

  // 4. Start LangGraph Multi-Agent Investigation
  const startInvestigation = (clerkId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLogs([]);
    setActiveClerk(clerkId);
    setIsRunning(true);
    setLatestReport(null);

    const es = new EventSource(`/api/agent/analyze/${clerkId}`);
    eventSourceRef.current = es;

    es.addEventListener('log', (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data]);
    });

    es.addEventListener('result', (e) => {
      const report = JSON.parse(e.data);
      setLatestReport(report);
      setReportsMap(prev => ({ ...prev, [clerkId]: report }));
      setAnalyzedClerks(prev => new Set(prev).add(clerkId));
      setIsRunning(false);
      es.close();
    });

    es.addEventListener('error', () => {
      setIsRunning(false);
      es.close();
    });
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <img src="/nagpur-police-logo.jpg" alt="Nagpur City Police" className="header-logo" />
          <div className="header-text">
            <h1>Nagpur Police Anti Corruption Bureau</h1>
            <p>Automated Land Fraud & Corruption Intelligence System</p>
          </div>
        </div>
        <div className="header-right">
          <div className="live-badge"><span className="live-dot"></span> LIVE</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-info">
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content — 2 columns */}
      <div className="main-grid">
        {/* Left: Terminal */}
        <div className="main-left">
          {isRunning && (
            <div className="status-bar running">
              <span className="dot"></span>
              AI Investigation Agent actively scanning {activeClerk}...
            </div>
          )}

          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot red"></div>
              <div className="terminal-dot yellow"></div>
              <div className="terminal-dot green"></div>
              <span className="terminal-title">investigation-feed.log</span>
            </div>
            <div className="terminal-body" ref={terminalRef}>
              {logs.length === 0 ? (
                <div className="placeholder">
                  <p>Select an administrative clerk below to initiate autonomous fraud analysis</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="log-line">
                    <span className="timestamp">[{log.timestamp || formatTimestamp()}]</span>{' '}
                    <span className={`phase-${log.phase}`}>[{log.phase}]</span>{' '}
                    <span className="message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent Alerts */}
        <div className="main-right">
          <div className="alerts-panel">
            <h3 className="panel-title">Intelligence Stream</h3>
            <div className="alerts-list">
              {RECENT_ALERTS.map((alert, i) => (
                <div key={i} className="alert-item">
                  <div className={`alert-dot alert-${alert.severity}`}></div>
                  <div className="alert-content">
                    <div className="alert-text">{alert.text}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Clerks Section */}
      <div className="clerks-section">
        <h2 className="clerks-title">
          <span className="clerks-icon">🏛️</span> Administrative Clerks Registry (Nagpur Division)
        </h2>

        {loadingClerks ? (
          <div className="clerks-loading">
            <div className="spinner"></div>
            <p>Loading administrative clerk registry...</p>
          </div>
        ) : (
          <div className="clerk-selector">
            {clerks.map((clerk, index) => (
              <button
                key={clerk.id}
                className={`clerk-btn ${activeClerk === clerk.id ? 'active' : ''} ${analyzedClerks.has(clerk.id) ? 'analyzed' : ''}`}
                onClick={() => startInvestigation(clerk.id)}
                disabled={isRunning}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="clerk-btn-top">
                  <span className="clerk-id">{clerk.id}</span>
                  <span className={`risk-badge risk-${clerk.risk ? clerk.risk.toLowerCase() : 'low'}`}>{clerk.risk}</span>
                </div>
                <div className="clerk-name">{clerk.name}</div>
                <div className="clerk-dept">{clerk.zone}</div>
                <div className="clerk-meta">{clerk.properties} approved properties</div>
                {analyzedClerks.has(clerk.id) && (
                  <div className="clerk-analyzed-badge">✓ Case Analyzed</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Visual Graph & Police Dossier Section */}
      {latestReport && (
        <div className="results-section">
          <GraphVisualizer
            graphData={latestReport.visualGraph}
            title={`${latestReport.clerkName} (${latestReport.clerkId}) — ${latestReport.patternTitle}`}
          />
          <PoliceDossier report={latestReport} />
        </div>
      )}
    </div>
  );
}

export default App;
