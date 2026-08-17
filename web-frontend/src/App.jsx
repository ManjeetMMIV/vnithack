import React, { useState } from 'react';
import axios from 'axios';
import { Upload, ShieldCheck, ShieldAlert, FileText, Database, Lock, Flame, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('entry');

  // Form State
  const [docId, setDocId] = useState('PROP-101');
  const [title, setTitle] = useState('Central Avenue Plot 4B');
  const [ownerName, setOwnerName] = useState('Dr. Vikram Sharma');
  const [areaSqFt, setAreaSqFt] = useState('2400');
  const [clerkId, setClerkId] = useState('NMC_OFFICER_07');
  const [uploadType, setUploadType] = useState('record'); // 'record' or 'file'
  const [file, setFile] = useState(null);

  // Status & Responses
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Verification State
  const [verifyId, setVerifyId] = useState('PROP-101');
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

  // 2. Handle Verification (Recompute Mongo Hash + Fetch Blockchain Hash)
  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true);
    setErrorMsg('');
    setAuditResult(null);

    try {
      const res = await axios.get(`${API_BASE}/documents/verify/${verifyId.trim()}`);
      setAuditResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Record not found.');
    } finally {
      setVerifying(false);
    }
  };

  // 3. Trigger Tamper Demo
  const handleTamper = async () => {
    try {
      await axios.post(`${API_BASE}/documents/tamper/${verifyId.trim()}`);
      alert(`MongoDB Record "${verifyId}" was maliciously altered! Click "Run Verification" to see the detection.`);
    } catch (err) {
      alert('Tamper execution failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span className="font-bold text-lg text-slate-100 tracking-wide">
              LAND REGISTRY // CRYPTO VERIFIER
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === 'entry' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
            >
              Data Entry Portal
            </button>
            <button
              onClick={() => setActiveTab('auditor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === 'auditor' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
            >
              Auditor Verifier
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'entry' ? (
          /* TAB 1: ENTRY & HASH COMMIT */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2 text-emerald-400">
                <Database className="w-5 h-5" />
                <span>Register Land Record or Document</span>
              </h2>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Record / Doc ID</label>
                    <input
                      type="text"
                      required
                      value={docId}
                      onChange={(e) => setDocId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 py-2 border-y border-slate-800/80">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      checked={uploadType === 'record'}
                      onChange={() => setUploadType('record')}
                    />
                    <span>Structured Land Record</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      checked={uploadType === 'file'}
                      onChange={() => setUploadType('file')}
                    />
                    <span>Upload Document File (PDF/Image)</span>
                  </label>
                </div>

                {uploadType === 'record' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Owner Name</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Area (Sq Ft)</label>
                        <input
                          type="number"
                          value={areaSqFt}
                          onChange={(e) => setAreaSqFt(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Clerk ID</label>
                        <input
                          type="text"
                          value={clerkId}
                          onChange={(e) => setClerkId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Select File</label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full text-slate-400 file:bg-slate-800 file:border-0 file:rounded file:px-3 file:py-1.5 file:text-slate-200 file:cursor-pointer"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{submitting ? 'Calculating Hash & Committing...' : 'Store in Mongo & Push Hash to Blockchain'}</span>
                </button>
              </form>
            </div>

            {/* Submission Output */}
            <div className="md:col-span-5 space-y-4">
              {submitResult ? (
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-5 rounded-xl text-xs font-mono space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Genesis Hash Generated & Sent</span>
                  </div>
                  <p><span className="text-slate-500">ID:</span> {submitResult.data.docId}</p>
                  <p><span className="text-slate-500">Status:</span> {submitResult.data.blockchainStatus}</p>
                  <p className="text-slate-500 mt-2">SHA-256 Hash:</p>
                  <p className="p-2 bg-slate-950 rounded border border-emerald-500/20 text-emerald-300 break-all">
                    {submitResult.data.hash}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-center text-slate-500 text-xs">
                  Fill out the form on the left to create a document, calculate its deterministic hash, and commit it to both MongoDB and the Blockchain node.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: AUDITOR VERIFICATION */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-lg font-bold mb-3 flex items-center space-x-2 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
                <span>Verify Document Integrity by ID</span>
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Record / Doc ID (e.g. PROP-101)..."
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-semibold text-sm transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Run Verification</span>
                </button>
              </div>

              {/* Demo Tamper Trigger */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Hackathon Simulation:</span>
                <button
                  onClick={handleTamper}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Simulate Attack (Tamper Mongo DB for `{verifyId}`)</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-mono">
                {errorMsg}
              </div>
            )}

            {/* Audit Comparison Output */}
            {auditResult && (
              <div className={`p-6 rounded-xl border shadow-xl space-y-4 font-mono text-xs ${auditResult.verification.isAuthentic
                  ? 'bg-emerald-950/20 border-emerald-500/50'
                  : 'bg-rose-950/30 border-rose-600'
                }`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    {auditResult.verification.isAuthentic ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-500" />
                    )}
                    <span className="text-sm font-bold text-slate-100">
                      {auditResult.verification.statusText}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-[10px] font-bold border ${auditResult.verification.isAuthentic
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                    {auditResult.verification.isAuthentic ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-slate-500 mb-1">Live Calculated Mongo Hash:</p>
                    <p className={`break-all ${auditResult.verification.isAuthentic ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {auditResult.verification.liveDatabaseHash}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-slate-500 mb-1">Blockchain Stored Immutable Hash:</p>
                    <p className="break-all text-cyan-400">
                      {auditResult.verification.blockchainStoredHash}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
