import { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';

export default function AdminRoute() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Check session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_pin');
    if (stored) {
      setPin(stored);
      setAuthed(true);
    }
  }, []);

  if (!isAdmin) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem('admin_pin', inputPin);
        setPin(inputPin);
        setAuthed(true);
      } else {
        setError('Invalid PIN');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_pin');
    setAuthed(false);
    setPin('');
    setInputPin('');
  }

  if (!authed) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050507] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm text-white font-bold">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Solens Admin</h1>
              <p className="text-xs text-white/30">Enter your PIN to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Admin PIN"
              value={inputPin}
              onChange={e => setInputPin(e.target.value)}
              autoFocus
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-violet-500/60 transition-colors"
            />
            {error && (
              <p className="text-sm text-red-400/80 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !inputPin}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                'Enter'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard pin={pin} onLogout={handleLogout} />;
}
