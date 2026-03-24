import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BookingModal({ open, planLabel, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    } else {
      setStatus('idle');
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
      setErrorMsg('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, plan: planLabel, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] shadow-2xl shadow-black/60 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're on the list</h2>
            <p className="text-white/40 text-sm">
              We'll be in touch within 24 hours to get you set up. Check your inbox for a confirmation.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">{planLabel}</p>
              <h2 className="text-2xl font-bold text-white">Book a Free Strategy Call</h2>
              <p className="text-sm text-white/35 mt-1">We'll reach out within 24 hours to schedule.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Name <span className="text-violet-400">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/60 outline-none rounded-xl px-3.5 py-2.5 text-white/80 placeholder-white/20 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Work Email <span className="text-violet-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@youragency.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/60 outline-none rounded-xl px-3.5 py-2.5 text-white/80 placeholder-white/20 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">Agency / Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Smith Web Studio"
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/60 outline-none rounded-xl px-3.5 py-2.5 text-white/80 placeholder-white/20 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  Anything else? <span className="text-white/25">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your agency, client volume, or any questions..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/60 outline-none rounded-xl px-3.5 py-2.5 text-white/80 placeholder-white/20 text-sm transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-shine relative overflow-hidden w-full flex items-center justify-center gap-2
                  rounded-xl px-6 py-3.5 text-sm font-semibold text-white
                  bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  shadow-lg shadow-violet-500/25 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{status === 'loading' ? 'Sending…' : 'Book My Strategy Call'}</span>
                {status !== 'loading' && (
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-150" />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
