import React, { useState } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Lock,
  Flame,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck2,
  Search
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('entry');

  // Form State
  const [docId, setDocId] = useState('NMC-LAND-2026-089');
  const [title, setTitle] = useState('Plot No. 42B, Civil Lines, Nagpur');
  const [ownerName, setOwnerName] = useState('Dr. Vikram Sharma');
  const [areaSqFt, setAreaSqFt] = useState('2400');
  const [clerkId, setClerkId] = useState('REG-OFFICER-MH09');
  const [uploadType, setUploadType] = useState('record');
  const [file, setFile] = useState(null);

  // Status & Responses
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Verification State
  const [verifyId, setVerifyId] = useState('NMC-LAND-2026-089');
  const [verifying, setVerifying] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Handle Submission (Mongo + Blockchain POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSubmitResult(null);

    const formData = new FormData();
    formData.append('docId', docId);
    formData.append('title', title);

    if (uploadType === 'file' && file) {
      formData.append('file', file);
    } else {
      formData.append('ownerName', ownerName);
      formData.append('areaSqFt', areaSqFt);
      formData.append('clerkId', clerkId);
      formData.append('latitude', '21.1458');
      formData.append('longitude', '79.0882');
    }

    try {
      const res = await axios.post(`${API_BASE}/documents`, formData);
      setSubmitResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Handle Verification
  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true);
    setErrorMsg('');
    setAuditResult(null);

    try {
      const res = await axios.get(`${API_BASE}/documents/verify/${verifyId.trim()}`);
      setAuditResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Record ID not found in database.');
    } finally {
      setVerifying(false);
    }
  };

  // 3. Trigger Tamper Demo
  const handleTamper = async () => {
    try {
      await axios.post(`${API_BASE}/documents/tamper/${verifyId.trim()}`);
      alert(`[SECURITY ALERT] MongoDB Record "${verifyId}" has been maliciously modified directly on the central server! Now click 'Verify Authenticity' to see the cryptographic proof of tampering.`);
    } catch (err) {
      alert('Tamper simulation failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col justify-between">

      {/* 1. Indian National Flag Top Ribbon */}
      <div className="w-full h-1.5 grid grid-cols-3">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* 2. Official Government Header Bar */}
      <header className="bg-white border-b border-slate-300 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">

          {/* Official Emblem + Nagpur City Police Logo + Titles */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="National Emblem of India"
              className="h-14 w-auto object-contain"
            />
            <img
              src="/nagpur-police.png"
              alt="Nagpur City Police"
              className="h-14 w-auto object-contain"
            />
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                Government of Maharashtra • Nagpur City Police & Cyber Cell • NMC
              </div>
              <h1 className="text-base md:text-xl font-black tracking-tight text-[#003366] flex items-center gap-2">
                NAGPUR DIGITAL LAND REGISTRY & TAMPER-DETECTION PORTAL
              </h1>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="font-semibold text-slate-700">सद्रक्षणाय खलनिग्रहणाय</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">Decentralized Cryptographic Ledger Enabled</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-4 py-2 rounded-md text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'entry'
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200'
                }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Clerk Registration Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('auditor')}
              className={`px-4 py-2 rounded-md text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'auditor'
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200'
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Auditor & Vigilance Verifier</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow">

        {/* Notice Banner */}
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-md flex items-center justify-between text-xs text-amber-900 shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Nagpur Police Cyber Cell Advisory:</strong> All registered property deeds are mathematically locked with SHA-256 genesis hashes on a blockchain ledger. Any unauthorized modifications to municipal database records are flagged automatically.
            </span>
          </div>
          <span className="hidden md:inline font-mono font-bold bg-amber-200/60 px-2 py-0.5 rounded text-[10px]">
            NODE: HARDHAT-EVM-ACTIVE
          </span>
        </div>

        {activeTab === 'entry' ? (
          /* TAB 1: DATA ENTRY & REGISTRATION */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Form Section */}
            <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center space-x-2 text-[#003366]">
                  <Building2 className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wide uppercase">Form L-01: Nagpur Municipal Deed Registration</span>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Live Intake
                </span>
              </div>

              <div className="p-6">
                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Unique Property / Deed ID <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={docId}
                        onChange={(e) => setDocId(e.target.value)}
                        placeholder="e.g. NMC-PROP-101"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">
                        Property Title / Description <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Plot 42, Civil Lines"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>
                  </div>

                  {/* Submission Format Selector */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <label className="block font-bold text-slate-700 uppercase mb-2">Record Attachment Mode</label>
                    <div className="flex gap-6">
                      <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="uploadType"
                          checked={uploadType === 'record'}
                          onChange={() => setUploadType('record')}
                          className="accent-[#003366]"
                        />
                        <span>Standard Structured Record</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="uploadType"
                          checked={uploadType === 'file'}
                          onChange={() => setUploadType('file')}
                          className="accent-[#003366]"
                        />
                        <span>Official Scanned Document (PDF / Image)</span>
                      </label>
                    </div>
                  </div>

                  {uploadType === 'record' ? (
                    <div className="space-y-3 bg-slate-50/50 p-3.5 rounded border border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Registered Owner Full Name</label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Total Area (Square Feet)</label>
                          <input
                            type="number"
                            value={areaSqFt}
                            onChange={(e) => setAreaSqFt(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#003366]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Clerk / Officer ID</label>
                          <input
                            type="text"
                            value={clerkId}
                            onChange={(e) => setClerkId(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#003366]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 p-3.5 rounded border border-slate-200">
                      <label className="block font-bold text-slate-700 mb-1">Select Scanned Deed File</label>
                      <input
                        type="file"
                        required
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#003366] file:text-white hover:file:bg-[#002244] file:cursor-pointer"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 px-4 rounded shadow transition cursor-pointer flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{submitting ? 'Generating Cryptographic Signature...' : 'Digitally Sign & Register Record'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Information & Receipt Panel */}
            <div className="lg:col-span-5 space-y-4">
              {submitResult ? (
                <div className="bg-white border border-emerald-400 rounded-lg p-5 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 pb-2 border-b border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm">Receipt: Registration Completed</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p><strong className="text-slate-900">Deed ID:</strong> <span className="font-mono">{submitResult.data.docId}</span></p>
                    <p><strong className="text-slate-900">Title:</strong> {submitResult.data.title}</p>
                    <p><strong className="text-slate-900">Ledger Status:</strong> <span className="font-semibold text-emerald-700">{submitResult.data.blockchainStatus}</span></p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">SHA-256 Digital Fingerprint (Genesis Hash):</span>
                    <p className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 break-all select-all">
                      {submitResult.data.newCalculatedHash || submitResult.data.hash}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 italic">
                    This hash is permanently anchored. Any subsequent changes will invalidate the verification state.
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-300 rounded-lg p-6 text-center text-slate-500 shadow-sm">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <h3 className="font-bold text-slate-700 text-sm mb-1">No Active Registration</h3>
                  <p className="text-xs leading-relaxed">
                    Submit the form to commit property details to the Central MongoDB Vault and push the cryptographic hash to the decentralized blockchain layer.
                  </p>
                </div>
              )}

              {/* Security Guideline Card */}
              <div className="bg-[#f4f7fa] border border-slate-300 rounded-lg p-4 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-[#003366] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Nagpur Cyber & Vigilance Directive</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Land registry entries are protected under Information Technology Act, 2000 and ISO/IEC 27001 standards. Cryptographic hashes stored on-chain serve as legal proof of non-repudiation in vigilance and police inquiries.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: AUDITOR VERIFICATION & TAMPER PROOF */
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Search Box Card */}
            <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-[#003366] mb-2">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-wide">
                  Nagpur Police & Central Vigilance Verification Engine
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Enter the Record / Deed ID to independently recalculate its live hash from the central database and compare it against the immutable genesis hash stored on the blockchain ledger.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Property / Deed ID (e.g. NMC-LAND-2026-089)..."
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2.5 rounded-md font-bold text-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? <RefreshCw className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                  <span>Verify Authenticity</span>
                </button>
              </div>

              {/* Demo Attack Simulator Card */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 bg-red-50/50 p-3 rounded border border-red-100">
                <div>
                  <span className="font-bold text-xs text-red-900 block">Vigilance Demo Simulation:</span>
                  <span className="text-[11px] text-red-700">Illegally alter the owner or document in the central database without updating the blockchain.</span>
                </div>
                <button
                  onClick={handleTamper}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Simulate Malicious Server Attack</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Audit Verdict Card */}
            {auditResult && (
              <div className={`bg-white rounded-lg border-2 shadow-sm overflow-hidden ${auditResult.verification.isAuthentic
                  ? 'border-emerald-600'
                  : 'border-red-600'
                }`}>

                {/* Header Banner */}
                <div className={`p-4 flex flex-wrap justify-between items-center gap-2 ${auditResult.verification.isAuthentic
                    ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                    : 'bg-red-50 text-red-900 border-b border-red-200'
                  }`}>
                  <div className="flex items-center space-x-3">
                    {auditResult.verification.isAuthentic ? (
                      <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-7 h-7 text-red-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-[11px] uppercase font-bold tracking-wider opacity-80">
                        Integrity Verdict Report
                      </div>
                      <div className="text-sm font-black tracking-tight">
                        {auditResult.verification.statusText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <a
                      href={`http://localhost:5000/api/documents/view/${auditResult.docId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#003366]" />
                      <span>Inspect Raw Deed Record</span>
                    </a>
                    <span className={`px-3 py-1 rounded font-black text-xs uppercase tracking-widest border ${auditResult.verification.isAuthentic
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-red-600 text-white border-red-700'
                      }`}>
                      {auditResult.verification.isAuthentic ? 'VERIFIED' : 'TAMPER DETECTED'}
                    </span>
                  </div>
                </div>

                {/* Audit Body / Side-by-Side Hashes */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

                    {/* Live Computed Central DB Hash */}
                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 uppercase">Live Central Database Hash:</span>
                        <span className="text-[10px] font-semibold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                          Computed in Real-Time
                        </span>
                      </div>
                      <p className={`p-2 rounded font-mono text-[11px] break-all border ${auditResult.verification.isAuthentic
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                          : 'bg-red-50 border-red-300 text-red-900'
                        }`}>
                        {auditResult.verification.liveDatabaseHash}
                      </p>
                    </div>

                    {/* Blockchain Immutable Genesis Hash */}
                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 uppercase">Blockchain Immutable Vault Hash:</span>
                        <span className="text-[10px] font-semibold bg-[#003366] text-white px-2 py-0.5 rounded">
                          Source of Truth
                        </span>
                      </div>
                      <p className="p-2 rounded font-mono text-[11px] break-all border bg-blue-50/60 border-blue-200 text-[#003366]">
                        {auditResult.verification.blockchainStoredHash}
                      </p>
                    </div>
                  </div>

                  {/* Tamper Analysis Text */}
                  {!auditResult.verification.isAuthentic && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded text-xs text-red-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Cryptographic Discrepancy Breakdown:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        The SHA-256 digest of the current record in the centralized MongoDB server does not match the immutable cryptographic commitment sealed on the blockchain. The central record has been maliciously modified without decentralized consensus.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Official Government Footer */}
      <footer className="bg-white border-t border-slate-300 mt-12 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="India Emblem"
              className="h-7 w-auto"
            />
            <img
              src="/nagpur-police.png"
              alt="Nagpur City Police"
              className="h-7 w-auto"
            />
            <span className="font-semibold text-slate-800">
              Nagpur City Police • Cyber Crime Cell & NMC Governance
            </span>
          </div>
          <div>
            Cryptographic Integrity & Anti-Tamper System
          </div>
        </div>
      </footer>
    </div>
  );
}
