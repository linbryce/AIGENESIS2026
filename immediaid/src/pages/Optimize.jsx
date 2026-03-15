import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Zap, RotateCcw } from 'lucide-react';
import MessageBubble from '../components/optimize/MessageBubble';

const SUGGESTIONS = [
  "Optimize routes for all high-priority demand points",
  "Identify warehouses with critical inventory shortfalls",
  "Redistribute medical supplies to cover unmet demand",
  "Which demand points have no assigned route?",
];

export default function Optimize() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'logistics_optimizer',
      metadata: { name: 'Logistics Session' },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
    });
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation || loading) return;
    setInput('');
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: msg });
    setLoading(false);
  };

  const reset = async () => {
    setMessages([]);
    setConversation(null);
    await initConversation();
  };

  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Logistics AI</p>
            <p className="text-xs text-muted-foreground">Route & inventory optimizer</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {visibleMessages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Logistics Optimizer</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Ask me to optimize routes, reallocate inventory, or analyze supply gaps.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-muted/50 text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-white border border-border rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-border px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-2 bg-muted/40 rounded-2xl px-4 py-2 border border-border">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask me to optimize routes or inventory..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed max-h-32"
            style={{ fieldSizing: 'content' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}