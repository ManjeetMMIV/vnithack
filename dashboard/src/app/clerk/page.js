"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClerkPortal() {
  const [createData, setCreateData] = useState({ propertyId: "", owner: "", coordinates: "", clerkId: "" });
  const [hackData, setHackData] = useState({ propertyId: "", newOwner: "" });
  
  const [createStatus, setCreateStatus] = useState(null);
  const [hackStatus, setHackStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateStatus(null);
    try {
      const res = await fetch("http://localhost:5000/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData)
      });
      const data = await res.json();
      if (res.ok) {
        setCreateStatus({ type: 'success', message: `Success! Tx Hash: ${data.blockchainTx.substring(0,20)}...` });
        setCreateData({ propertyId: "", owner: "", coordinates: "", clerkId: "" });
      } else {
        setCreateStatus({ type: 'error', message: data.error || "Failed to create record." });
      }
    } catch (err) {
      setCreateStatus({ type: 'error', message: "Network error. Backend might be down." });
    }
    setIsSubmitting(false);
  };

  const handleHack = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHackStatus(null);
    try {
      const res = await fetch(`http://localhost:5000/api/hack/${hackData.propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwner: hackData.newOwner })
      });
      const data = await res.json();
      if (res.ok) {
        setHackStatus({ type: 'success', message: "SYSTEM COMPROMISED: Database secretly altered." });
        setHackData({ propertyId: "", newOwner: "" });
      } else {
        setHackStatus({ type: 'error', message: data.error || "Failed to alter record." });
      }
    } catch (err) {
      setHackStatus({ type: 'error', message: "Network error." });
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 p-8 font-mono text-neutral-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm mb-2 inline-block">← Back to Portal</Link>
            <h1 className="text-3xl font-bold tracking-tighter text-white">
              NMC <span className="text-emerald-500">Clerk Interface</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2 rounded-full border border-emerald-900/50">
             <span className="text-sm font-bold text-emerald-400">POLYGON TESTNET CONNECTED</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create Record Form */}
          <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Register Land Record
            </h2>

            <form onSubmit={handleCreate} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Property ID</label>
                <input required type="text" value={createData.propertyId} onChange={e => setCreateData({...createData, propertyId: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. PROP-999" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Owner Name</label>
                <input required type="text" value={createData.owner} onChange={e => setCreateData({...createData, owner: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Coordinates</label>
                <input required type="text" value={createData.coordinates} onChange={e => setCreateData({...createData, coordinates: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. 21.1458 N, 79.0882 E" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Clerk ID</label>
                <input required type="text" value={createData.clerkId} onChange={e => setCreateData({...createData, clerkId: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. CLK-089" />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 disabled:opacity-50">
                Mint to Blockchain
              </button>
            </form>

            {createStatus && (
              <div className={`mt-4 p-4 rounded-lg border text-sm ${createStatus.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
                {createStatus.message}
              </div>
            )}
          </div>

          {/* Secret Hacker Form */}
          <div className="bg-red-950/20 backdrop-blur-md border border-red-900/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none group-hover:bg-red-500/10 transition-all"></div>
            
            <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Demo: Tamper Database
            </h2>
            <p className="text-xs text-red-400/60 mb-6">Secretly alters MongoDB without touching the blockchain to demonstrate tamper detection.</p>

            <form onSubmit={handleHack} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">Target Property ID</label>
                <input required type="text" value={hackData.propertyId} onChange={e => setHackData({...hackData, propertyId: e.target.value})} className="w-full bg-neutral-950 border border-red-900/30 rounded-lg px-4 py-3 text-red-100 focus:outline-none focus:border-red-500 transition-colors" placeholder="e.g. PROP-999" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">Fraudulent Owner Name</label>
                <input required type="text" value={hackData.newOwner} onChange={e => setHackData({...hackData, newOwner: e.target.value})} className="w-full bg-neutral-950 border border-red-900/30 rounded-lg px-4 py-3 text-red-100 focus:outline-none focus:border-red-500 transition-colors" placeholder="e.g. Scammer Name" />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-red-900/50 hover:bg-red-700 text-red-200 font-bold py-3 px-4 rounded-lg border border-red-800 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] mt-6 disabled:opacity-50">
                Execute Hack
              </button>
            </form>

            {hackStatus && (
              <div className={`mt-4 p-4 rounded-lg border text-sm ${hackStatus.type === 'success' ? 'bg-red-900/40 border-red-500/50 text-red-200' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
                {hackStatus.message}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
