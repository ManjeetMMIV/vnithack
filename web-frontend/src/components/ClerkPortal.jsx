import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, ShieldAlert, CheckCircle2, Lock, Flame } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function ClerkPortal() {
    const [formData, setFormData] = useState({
        propertyId: 'NMC-PROP-1001',
        ownerName: 'Dr. Vikram Sharma',
        latitude: '21.1458',
        longitude: '79.0882',
        areaSqFt: '2400',
        clerkId: 'NMC_OFFICER_04'
    });

    const [loading, setLoading] = useState(false);
    const [createdRecord, setCreatedRecord] = useState(null);
    const [tamperStatus, setTamperStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setCreatedRecord(null);
        setTamperStatus(null);

        try {
            const payload = {
                propertyId: formData.propertyId,
                ownerName: formData.ownerName,
                coordinates: {
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude)
                },
                areaSqFt: parseFloat(formData.areaSqFt),
                clerkId: formData.clerkId
            };

            const res = await axios.post(`${API_BASE}/records`, payload);
            setCreatedRecord(res.data.data);
        } catch (err) {
            setErrorMessage(err.response?.data?.error || 'Failed to submit record.');
        } finally {
            setLoading(false);
        }
    };

    const triggerMaliciousTamper = async () => {
        if (!formData.propertyId) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/records/tamper`, {
                propertyId: formData.propertyId,
                maliciousNewOwner: 'Gangs of Wasseypur Syndicate LLC',
                maliciousClerkId: 'ROGUE_CLERK_999'
            });
            setTamperStatus(res.data);
        } catch (err) {
            setErrorMessage(err.response?.data?.error || 'Failed to tamper record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
                    <PlusCircle className="text-emerald-400 h-6 w-6" />
                    <h2 className="text-xl font-bold text-slate-100">Official NMC Land Registration Portal</h2>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Property ID</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                                value={formData.propertyId}
                                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Official Owner Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                                value={formData.ownerName}
                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Area (Sq Ft)</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                                value={formData.areaSqFt}
                                onChange={(e) => setFormData({ ...formData, areaSqFt: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Authorized Clerk ID</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                            value={formData.clerkId}
                            onChange={(e) => setFormData({ ...formData, clerkId: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                    >
                        <Lock className="w-4 h-4" />
                        <span>{loading ? 'Processing Cryptographic Hash...' : 'Sign & Register Record'}</span>
                    </button>
                </form>
            </div>

            {/* Live Controls & Output */}
            <div className="lg:col-span-5 space-y-6">
                {createdRecord && (
                    <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-3">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Record Saved & Hashed</span>
                        </div>
                        <div className="text-xs font-mono space-y-2 text-slate-300 break-all">
                            <p><span className="text-slate-500">ID:</span> {createdRecord.propertyId}</p>
                            <p><span className="text-slate-500">Owner:</span> {createdRecord.ownerName}</p>
                            <p><span className="text-slate-500">Genesis SHA-256 Hash:</span></p>
                            <div className="p-2 bg-slate-950 border border-emerald-500/30 rounded text-emerald-400 font-mono text-[11px]">
                                {createdRecord.storedExpectedHash}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-rose-950/20 border border-rose-600/30 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center space-x-2 text-rose-400 font-bold mb-2">
                        <Flame className="w-5 h-5" />
                        <span>Live Hack / Tamper Demo Trigger</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                        Simulate a database breach where an unauthorized party changes the owner directly in MongoDB without consensus.
                    </p>

                    <button
                        onClick={triggerMaliciousTamper}
                        disabled={loading}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                    >
                        <ShieldAlert className="w-5 h-5" />
                        <span>Simulate DB Hack (Maliciously Alter Owner)</span>
                    </button>

                    {tamperStatus && (
                        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/40 rounded text-xs font-mono text-rose-300">
                            <p className="font-bold">Tamper Injected in MongoDB:</p>
                            <p>Target ID: {formData.propertyId}</p>
                            <p>New Owner: {tamperStatus.tamperedRecord.ownerName}</p>
                            <p className="mt-1 text-slate-400">Switch to the Auditor Dashboard to observe the verification failure.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}