import React, { useState } from 'react';
import axios from 'axios';
import { Upload, ShieldCheck, ShieldAlert, FileText, Lock, Flame } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function DocUploadVerify() {
    const [docId, setDocId] = useState('DOC-2026-001');
    const [title, setTitle] = useState('Land Deed Agreement');
    const [file, setFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'

    const [uploadResult, setUploadResult] = useState(null);
    const [verifyId, setVerifyId] = useState('DOC-2026-001');
    const [auditResult, setAuditResult] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    // Handle Document Upload
    const handleUpload = async (e) => {
        e.preventDefault();
        setStatusMsg('Hashing and submitting...');
        setUploadResult(null);

        const formData = new FormData();
        formData.append('docId', docId);
        formData.append('title', title);

        if (uploadMode === 'file' && file) {
            formData.append('file', file);
        } else {
            formData.append('textContent', textContent);
        }

        try {
            const res = await axios.post(`${API_BASE}/upload`, formData);
            setUploadResult(res.data);
            setStatusMsg(' Uploaded to MongoDB & Hash committed to Blockchain!');
        } catch (err) {
            setStatusMsg(err.response?.data?.error || 'Upload failed.');
        }
    };

    // Run Integrity Audit
    const handleVerify = async () => {
        setStatusMsg('Verifying against on-chain hash...');
        setAuditResult(null);
        try {
            const res = await axios.get(`${API_BASE}/verify/${verifyId}`);
            setAuditResult(res.data);
            setStatusMsg('');
        } catch (err) {
            setStatusMsg(err.response?.data?.error || 'Verification failed.');
        }
    };

    // Demo Tamper Button
    const handleTamper = async () => {
        try {
            await axios.post(`${API_BASE}/tamper/${verifyId}`);
            alert(`MongoDB document ${verifyId} maliciously altered! Now run verify.`);
        } catch (err) {
            alert('Failed to tamper document.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-slate-100">

            {/* Upload Section */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
                <h2 className="text-lg font-bold mb-4 flex items-center space-x-2 text-emerald-400">
                    <Upload className="w-5 h-5" />
                    <span>Upload Document / File</span>
                </h2>

                <form onSubmit={handleUpload} className="space-y-4 text-sm">
                    <div>
                        <label className="block text-slate-400 mb-1">Unique Document ID</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                            value={docId}
                            onChange={(e) => setDocId(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 mb-1">Document Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <label className="cursor-pointer">
                            <input
                                type="radio"
                                checked={uploadMode === 'file'}
                                onChange={() => setUploadMode('file')}
                                className="mr-1"
                            />
                            Upload File (PDF/Image/Doc)
                        </label>
                        <label className="cursor-pointer">
                            <input
                                type="radio"
                                checked={uploadMode === 'text'}
                                onChange={() => setUploadMode('text')}
                                className="mr-1"
                            />
                            Raw Text / JSON
                        </label>
                    </div>

                    {uploadMode === 'file' ? (
                        <div>
                            <input
                                type="file"
                                required
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full text-slate-400 file:bg-slate-800 file:border-0 file:rounded file:px-3 file:py-1.5 file:text-slate-200 file:cursor-pointer"
                            />
                        </div>
                    ) : (
                        <div>
                            <textarea
                                rows="4"
                                placeholder="Paste document text or JSON..."
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono text-xs"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold py-2.5 rounded cursor-pointer transition flex items-center justify-center space-x-2"
                    >
                        <Lock className="w-4 h-4" />
                        <span>Store & Commit Hash to Blockchain</span>
                    </button>
                </form>

                {uploadResult && (
                    <div className="mt-4 p-3 bg-slate-950 border border-emerald-500/40 rounded text-xs font-mono space-y-1">
                        <p className="text-emerald-400 font-bold">Genesis Hash Generated:</p>
                        <p className="break-all text-slate-300">{uploadResult.hash}</p>
                    </div>
                )}
            </div>

            {/* Verify & Tamper Section */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6">
                <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center space-x-2 text-cyan-400">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Auditor Integrity Verification</span>
                    </h2>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Document ID..."
                            className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono text-sm"
                            value={verifyId}
                            onChange={(e) => setVerifyId(e.target.value)}
                        />
                        <button
                            onClick={handleVerify}
                            className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded font-semibold text-sm cursor-pointer"
                        >
                            Verify
                        </button>
                    </div>
                </div>

                {/* Demo Tamper Trigger */}
                <div className="p-3 bg-rose-950/20 border border-rose-600/30 rounded-lg">
                    <p className="text-xs text-rose-300 mb-2">Hackathon Demo: Mutate MongoDB doc directly without blockchain consensus.</p>
                    <button
                        onClick={handleTamper}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded text-xs flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        <Flame className="w-4 h-4" />
                        <span>Simulate Direct Database Hack on `{verifyId}`</span>
                    </button>
                </div>

                {/* Audit Results */}
                {auditResult && (
                    <div className={`p-4 rounded-lg border text-xs font-mono space-y-3 ${auditResult.verification.isAuthentic
                            ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/30 border-rose-600 text-rose-300'
                        }`}>
                        <div className="flex justify-between font-bold text-sm">
                            <span>VERDICT:</span>
                            <span>{auditResult.verification.status}</span>
                        </div>

                        <div>
                            <p className="text-slate-500">Live MongoDB Computed Hash:</p>
                            <p className="break-all p-1.5 bg-slate-950 rounded mt-1">{auditResult.verification.currentDatabaseHash}</p>
                        </div>

                        <div>
                            <p className="text-slate-500">Blockchain Immutable Hash:</p>
                            <p className="break-all p-1.5 bg-slate-950 rounded mt-1">{auditResult.verification.blockchainImmutableHash}</p>
                        </div>
                    </div>
                )}

                {statusMsg && <p className="text-xs text-slate-400 font-mono">{statusMsg}</p>}
            </div>
        </div>
    );
}