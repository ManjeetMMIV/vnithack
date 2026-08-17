import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 font-mono relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="z-10 text-center max-w-3xl">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          BhumiRakshak V1.0
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 drop-shadow-2xl">
          Land Fraud <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Detection Engine</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Select your portal to enter the decentralized land registry. Secure records as a Clerk, or investigate tampering as a Security Auditor.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          
          <Link href="/clerk" className="group relative w-full md:w-72 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 text-left flex flex-col items-start cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">NMC Clerk</h2>
            <p className="text-sm text-neutral-500">Mint secure land records directly to the Polygon blockchain.</p>
          </Link>

          <Link href="/auditor" className="group relative w-full md:w-72 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 hover:border-red-500/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:-translate-y-1 text-left flex flex-col items-start cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">Auditor</h2>
            <p className="text-sm text-neutral-500">Verify records, detect tampering, and launch AI investigations.</p>
          </Link>

        </div>
      </div>
    </main>
  );
}
