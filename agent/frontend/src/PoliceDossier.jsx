import React from 'react';

export default function PoliceDossier({ report }) {
  if (!report) return null;

  const isClean = report.status === 'CLEAN' || report.status === 'CLEAN_RECORD';
  const riskPercent = Math.round((report.riskScore || 0) * 100);

  return (
    <div className={`police-dossier-card ${isClean ? 'dossier-clean' : 'dossier-flagged'}`}>
      <div className="dossier-header">
        <div className="dossier-badge-row">
          <span className="police-tag">NAGPUR POLICE ANTI-CORRUPTION BUREAU</span>
          <span className={`status-pill ${isClean ? 'pill-clean' : 'pill-critical'}`}>
            {report.status}
          </span>
        </div>
        <h2 className="dossier-title">{report.patternTitle || 'Forensic Investigation Report'}</h2>
        <div className="dossier-meta">
          <span>Target Officer: <strong>{report.clerkName} ({report.clerkId})</strong></span>
          <span>•</span>
          <span>Jurisdiction: <strong>{report.zone}</strong></span>
          <span>•</span>
          <span>Department: <strong>{report.department}</strong></span>
        </div>
      </div>

      <div className="dossier-body">
        {/* Risk Score & Key Metrics */}
        <div className="dossier-grid">
          <div className="risk-metric-box">
            <div className="risk-metric-label">Calculated Corruption Risk</div>
            <div className="risk-metric-value" style={{ color: isClean ? '#00b894' : riskPercent > 70 ? '#d63031' : '#e17055' }}>
              {riskPercent}%
            </div>
            <div className="risk-metric-bar">
              <div
                className="risk-metric-fill"
                style={{
                  width: `${riskPercent}%`,
                  backgroundColor: isClean ? '#00b894' : riskPercent > 70 ? '#d63031' : '#e17055',
                }}
              />
            </div>
          </div>

          <div className="violations-box">
            <div className="section-subtitle">Applicable Statutory Violations</div>
            {report.statutoryViolations && report.statutoryViolations.length > 0 ? (
              <div className="violation-tags">
                {report.statutoryViolations.map((v, i) => (
                  <span key={i} className="violation-tag">{v}</span>
                ))}
              </div>
            ) : (
              <div className="no-violations">✓ No statutory violations detected</div>
            )}
          </div>
        </div>

        {/* Suspect Roster */}
        {report.suspectRoster && report.suspectRoster.length > 0 && (
          <div className="dossier-section">
            <div className="section-subtitle">Identified Syndicate Suspect Roster</div>
            <div className="suspect-table">
              <div className="suspect-header-row">
                <span>Suspect Name</span>
                <span>Role / Designation</span>
                <span>Forensic Implication</span>
              </div>
              {report.suspectRoster.map((s, i) => (
                <div key={i} className="suspect-row">
                  <span className="suspect-name">{s.name}</span>
                  <span className="suspect-role">{s.role}</span>
                  <span className="suspect-imp">{s.implication}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning Bullets */}
        {report.reasoningSteps && report.reasoningSteps.length > 0 && (
          <div className="dossier-section">
            <div className="section-subtitle">Autonomous AI Analytical Deductions</div>
            <ul className="reasoning-list">
              {report.reasoningSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Directive */}
        <div className="dossier-action-box">
          <div className="action-label">Recommended Police Enforcement Action</div>
          <div className="action-text">{report.recommendedAction}</div>
        </div>
      </div>
    </div>
  );
}
