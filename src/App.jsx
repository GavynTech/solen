import './index.css';
import Hero            from './components/Hero';
import ArchitectureMap from './components/ArchitectureMap';
import Features        from './components/Features';
import Pricing         from './components/Pricing';
import ChatWidget      from './components/ChatWidget';

export default function App() {
  return (
    <div className="bg-[#050507] min-h-screen">
      <Hero />
      <ArchitectureMap />
      <Features />
      <Pricing />

      <ChatWidget />

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/[0.04] bg-[#050507] px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">S</span>
            </div>
            <span className="text-sm font-semibold text-white/50">
              Solen<span className="text-violet-400">.</span>
            </span>
          </div>
          <p className="text-xs text-white/20 text-center">
            © {new Date().getFullYear()} Solen · Automated Business Systems ·
            Built with n8n, Apollo.io, and GPT-4o
          </p>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
