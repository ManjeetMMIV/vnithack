import React from 'react';
import { ShieldCheck, Database, AlertOctagon } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
    return (
        <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                    <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        LAND-SECURE // NMC REGISTRY
                    </span>
                </div>

                <nav className="flex space-x-2">
                    <button
                        onClick={() => setCurrentTab('clerk')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'clerk'
                                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        <span>NMC Clerk Portal</span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('auditor')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentTab === 'auditor'
                                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <AlertOctagon className="w-4 h-4" />
                        <span>Auditor Dashboard</span>
                    </button>
                </nav>
            </div>
        </header>
    );
}