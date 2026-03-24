import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Zap } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hey! I'm Solen's AI assistant. Ask me anything about our automated lead intelligence system — pricing, how it works, or getting started.",
};

export default function ChatWidget() {
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    // Skip the initial greeting (index 0) — it's display-only, not real conversation history
    const history = [...messages.slice(1), userMsg];

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg = err.message?.includes('Server error 429')
        ? "I'm a bit busy right now — try again in a moment."
        : 'Connection error. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div className="w-[340px] rounded-2xl border border-white/[0.08] bg-[#0d0f14]/95 backdrop-blur-xl shadow-2xl shadow-black/70 overflow-hidden flex flex-col"
             style={{ maxHeight: '480px' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 leading-none">Solen Assistant</p>
              <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white/30 hover:text-white/70 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-violet-600/80 text-white rounded-br-sm'
                    : 'bg-white/[0.05] text-white/80 border border-white/[0.06] rounded-bl-sm'
                  }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 size={12} className="text-violet-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-white/[0.06] flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2
                text-xs text-white placeholder-white/25 outline-none
                focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/10
                disabled:opacity-50 transition-all duration-150"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
                hover:from-violet-500 hover:to-indigo-500
                disabled:from-violet-900 disabled:to-indigo-900 disabled:cursor-not-allowed
                flex items-center justify-center transition-all duration-150
                shadow-md shadow-violet-500/20">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle button ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-13 h-13 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600
          hover:from-violet-500 hover:to-indigo-500
          shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60
          flex items-center justify-center transition-all duration-200
          border border-white/10"
        style={{ width: '52px', height: '52px' }}
      >
        {open
          ? <X size={20} className="text-white" />
          : <MessageCircle size={20} className="text-white" />
        }
      </button>
    </div>
  );
}
