'use client';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-8 mt-auto">
      {/* flex-col, items-center, dan text-center bakal bikin semuanya persis di tengah */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-black uppercase tracking-tighter text-slate-900">
          SIAP BISNIS FORUM
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          © {new Date().getFullYear()} '
          Powered by EKRAF & PT. PANCA CENTRAL ABADI
        </p>
      </div>
    </footer>
  );
}