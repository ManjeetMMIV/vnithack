import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, ShieldCheck, RefreshCw, GitCommit, Network } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AuditorDashboard() {
    const [searchId, setSearchId] = useState('NMC-PROP-1001');
    const [result, setResult] = useState(null);
    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchRecords = async () => {
        try {
            const res = await axios.get(`${API_BASE}/records`);
            setAllRecords(res.data.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!searchId.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.get(`${API_BASE}/records/verify/${searchId.trim()}`);
            setResult(res.data);
            fetchRecords();
        } catch (err) {
            setError(err.response?.data?.error || 'Property record not found');
        } finally {
            setLoading(false);
        }
    };

    const clerkStats = allRecords.reduce((acc, curr) => {
        const clerk = curr.clerkId || 'Unknown';
        if (!acc[clerk]) acc[clerk] = { name: clerk, total: 0, tampered: 0 };
        acc[clerk].total += 1;
        if (curr.isTampered) acc[clerk].tampered += 1;
        return acc;
    }, {});

    const chartData = Object.values(clerkStats);

    return (
        <div className="space-y-8">
            {/* Search Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center space-x-2">
                    <Network className="text-cyan-400 w-6 h-6" />
                    <span>Auditor Verification Engine</span>
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                    Real-time deterministic SHA-256 hash comparison between current database state and genesis state.
                </p>

                <form onSubmit={handleVerify} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Enter Property ID..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        <span>Run Audit</span>
                    </button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-mono text-sm">
                    {error}
                </div>
            )}

            {/* Verification Result Card */}
            {result && (
                <div
                    className={`border rounded-xl p-6 shadow-2xl transition-all ${result.verification.integrityPassed
                            ? 'bg-emerald-950/20 border-emerald-500/50'
                            : 'bg-rose-950/30 border-rose-600'
                        }`}
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                        <div className="flex items-center space-x-3">
                            {result.verification.integrityPassed ? (
                                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                            ) : (
                                <ShieldAlert className="w-10 h-10 text-rose-500" />
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-slate-100">
                                    Audit Verdict: {result.verification.status}
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">
                                    Property ID: {result.data.propertyId}
                                </p>
                            </div>
                        </div>

                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest uppercase border ${result.verification.integrityPassed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                            }`}>
                            {result.verification.integrityPassed ? 'INTEGRITY VERIFIED' : 'TAMPER DETECTED / HASH MISMATCH'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Record State</span>
                            <div className="text-sm font-mono space-y-1 text-slate-200">
                                <p><span className="text-slate-500">Current Owner:</span> <span className="font-bold text-amber-400">{result.data.ownerName}</span></p>
                                <p><span className="text-slate-500">Last Modified By:</span> {result.data.clerkId}</p>
                                <p><span className="text-slate-500">Coordinates:</span> {result.data.coordinates.latitude}, {result.data.coordinates.longitude}</p>
                                <p><span className="text-slate-500">Area:</span> {result.data.areaSqFt} Sq Ft</p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cryptographic Hashes</span>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[11px] text-slate-500 font-mono mb-1">Expected Genesis Hash:</p>
                                    <p className="p-2 bg-slate-900 rounded font-mono text-[11px] text-cyan-400 break-all border border-slate-800">
                                        {result.verification.expectedOriginalHash}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500 font-mono mb-1">Calculated Live DB Hash:</p>
                                    <p className={`p-2 rounded font-mono text-[11px] break-all border ${result.verification.integrityPassed
                                            ? 'bg-slate-900 text-emerald-400 border-slate-800'
                                            : 'bg-rose-950/40 text-rose-400 border-rose-500/50'
                                        }`}>
                                        {result.verification.currentCalculatedHash}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {result.data.history?.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                                <GitCommit className="w-4 h-4 text-cyan-400" />
                                <span>Modification Audit Trail</span>
                            </h4>
                            <div className="space-y-2 font-mono text-xs">
                                {result.data.history.map((item, idx) => (
                                    <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center text-slate-300">
                                        <div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] mr-2 font-bold ${item.action === 'UNAUTHORIZED_ALTERATION' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {item.action}
                                            </span>
                                            <span>By: {item.modifiedBy}</span>
                                        </div>
                                        <span className="text-slate-500 text-[11px]">{new Date(item.timestamp).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mafia / Rogue Entity Visualizer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center space-x-2">
                    <span>Syndicate / Mafia Activity Anomaly Detector</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                    Modifications aggregated by Clerk ID highlighting tampered record ratios.
                </p>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                            />
                            <Bar dataKey="total" name="Total Records" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="tampered" name="Tampered Records" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.tampered > 0 ? '#f43f5e' : '#10b981'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}