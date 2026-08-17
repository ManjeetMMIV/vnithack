import React from 'react';
import { Shield, Lock, Briefcase, Database, Link, Fingerprint } from 'lucide-react';
import './BlockchainUseCases.css';

export default function BlockchainUseCases() {
  return (
    <div className="usecase-page fade-in">
      <header className="page-header">
        <h1>Trust Layer & Use Cases</h1>
        <p className="subtitle">Quantum-secure blockchain infrastructure for Nagpur Municipal Corporation (NMC)</p>
      </header>

      <div className="architecture-overview">
        <h2><Database className="icon" /> The Polygon Integrity Layer</h2>
        <p>
          The system mitigates centralized database corruption by writing cryptographic hashes of all property 
          records to the Polygon Amoy blockchain. Even if an insider with admin access alters the MongoDB records, 
          the immutable smart contract acts as the ultimate source of truth.
        </p>
        <div className="flow-diagram">
          <div className="flow-step">
            <Fingerprint className="w-8 h-8 text-blue-400" />
            <span>1. Payload Hashing (SHA-256)</span>
          </div>
          <div className="flow-arrow"></div>
          <div className="flow-step">
            <Lock className="w-8 h-8 text-purple-400" />
            <span>2. Smart Contract Commit</span>
          </div>
          <div className="flow-arrow"></div>
          <div className="flow-step">
            <Link className="w-8 h-8 text-green-400" />
            <span>3. Real-time Audit Trigger</span>
          </div>
        </div>
      </div>

      <div className="use-case-grid">
        <div className="use-case-card">
          <div className="card-icon"><Briefcase /></div>
          <h3>Nagpur Municipal Corporation (NMC)</h3>
          <ul>
            <li><strong>Clerk Accountability:</strong> Tracks exactly who registered or modified which property.</li>
            <li><strong>Zero-Trust Auditing:</strong> Supervisors can instantly verify record authenticity without relying on IT staff.</li>
            <li><strong>Automated Red-Flagging:</strong> Automatically warns citizens if they are interacting with a tampered record.</li>
          </ul>
        </div>

        <div className="use-case-card">
          <div className="card-icon"><Shield /></div>
          <h3>Anti-Corruption Bureau (ACB)</h3>
          <ul>
            <li><strong>Syndicate Detection:</strong> LangGraph AI agents actively sweep the registry to find hidden cartels.</li>
            <li><strong>Non-Repudiation:</strong> Cryptographic proofs mean corrupt officials cannot deny their alterations.</li>
            <li><strong>Forensic Replays:</strong> Historical timelines of all modifications and their matching transaction hashes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
