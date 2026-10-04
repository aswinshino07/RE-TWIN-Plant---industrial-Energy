import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Send,
  ShieldCheck,
  Globe,
  Bot,
  User,
  AlertCircle,
  Lightbulb,
  Zap,
  Gauge,
  Activity,
  FileCheck,
  HelpCircle,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { AppLanguage } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    language,
    setLanguage,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello, I am the RE-TWIN Industrial Energy Analyst. All insights are strictly grounded in deterministic plant telemetry, OLS baseline regressions, and IPMVP Option C calculations.

I distinguish:
• [MEASURED]: Physical sub-meter readings
• [SIMULATED]: Telemetry model ticks & injected faults
• [ILLUSTRATIVE]: Cluster benchmark assumptions
• [VERIFIED]: Statistically proven savings (95% CI > 0)
• [INCONCLUSIVE]: Savings where uncertainty interval includes zero

Select a canonical query below or type your inquiry.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAiDrawerOpen) return null;

  // 8 Canonical Inquiries for the Industrial Energy Analyst
  const canonicalInquiries: {
    category: string;
    label: string;
    query: string;
  }[] = [
    {
      category: 'Diagnostic',
      label: 'Why is energy high?',
      query: 'Why is energy high compared to the normalised baseline?',
    },
    {
      category: 'Diagnostic',
      label: 'Which asset is wasting the most energy?',
      query: 'Which asset is wasting the most energy in the plant today?',
    },
    {
      category: 'Diagnostic',
      label: 'What caused this alert?',
      query: 'What caused the latest anomaly alert on the equipment?',
    },
    {
      category: 'Advisory',
      label: 'What should the plant manager do?',
      query: 'What should the plant manager do right now to mitigate energy waste?',
    },
    {
      category: 'Digital Twin',
      label: 'What happens if we repair the compressor?',
      query: 'What happens if we repair the compressor leaks and tune the unloader?',
    },
    {
      category: 'Digital Twin',
      label: 'How much could this save?',
      query: 'How much could the central energy efficiency package save annually?',
    },
    {
      category: 'M&V Audit',
      label: 'Why is a saving marked inconclusive?',
      query: 'Why is a saving marked inconclusive under IPMVP Option C guidelines?',
    },
    {
      category: 'Executive',
      label: "Summarise today's plant performance",
      query: "Summarise today's plant performance for the plant manager.",
    },
  ];

  const handleSend = async (userQuery: string) => {
    if (!userQuery.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Clean Architecture: Frontend -> Backend -> Deterministic Analytics -> Structured Result -> Gemini -> Natural-Language Explanation
      const res = await api.askAi({
        query: userQuery,
        language: language,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: res.explanation,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `Error connecting to AI Industrial Intelligence Service: ${err.message}. Please verify the server connection.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Formats text with color-coded classification tags
   */
  const renderFormattedText = (content: string) => {
    // Replace classification tags with styled inline badges
    const parts = content.split(/(\[(?:MEASURED|SIMULATED|ILLUSTRATIVE|VERIFIED|INCONCLUSIVE)\])/g);

    return (
      <span className="whitespace-pre-line leading-relaxed">
        {parts.map((part, idx) => {
          if (part === '[MEASURED]') {
            return (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1 py-0.2 text-[9px] font-mono font-bold mx-0.5"
              >
                MEASURED
              </span>
            );
          }
          if (part === '[SIMULATED]') {
            return (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1 py-0.2 text-[9px] font-mono font-bold mx-0.5"
              >
                SIMULATED
              </span>
            );
          }
          if (part === '[ILLUSTRATIVE]') {
            return (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1 py-0.2 text-[9px] font-mono font-bold mx-0.5"
              >
                ILLUSTRATIVE
              </span>
            );
          }
          if (part === '[VERIFIED]') {
            return (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 text-[9px] font-mono font-bold mx-0.5"
              >
                VERIFIED
              </span>
            );
          }
          if (part === '[INCONCLUSIVE]') {
            return (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1 py-0.2 text-[9px] font-mono font-bold mx-0.5"
              >
                INCONCLUSIVE
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-zinc-800 bg-zinc-950/98 shadow-2xl backdrop-blur-md">
      {/* Drawer Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-100">
                RE-TWIN Industrial Energy Analyst
              </h2>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-mono text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                Deterministic Grounding
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Server-Side Gemini 3.8 Flash • Zero Numerical Hallucination
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center rounded bg-zinc-900 border border-zinc-800 px-1 py-0.5 text-[10px] font-mono">
            <Globe className="h-3 w-3 mr-1 text-zinc-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="bg-transparent text-zinc-300 outline-none cursor-pointer"
            >
              <option value="en" className="bg-zinc-900 text-zinc-200">EN</option>
              <option value="ta" className="bg-zinc-900 text-zinc-200">தமிழ்</option>
              <option value="hi" className="bg-zinc-900 text-zinc-200">हिन्दी</option>
            </select>
          </div>

          <button
            onClick={() => setIsAiDrawerOpen(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Safety & Protocol Banner */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Calculations strictly performed by backend OLS & IPMVP engines</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-300">Auditor-Grade</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              {msg.sender === 'user' ? (
                <>
                  <span className="text-[10px] font-mono text-zinc-400">You (Plant Executive)</span>
                  <User className="h-3 w-3 text-zinc-400" />
                </>
              ) : (
                <>
                  <Bot className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    RE-TWIN Industrial Energy Analyst
                  </span>
                </>
              )}
              <span className="text-[9px] font-mono text-zinc-400">• {msg.timestamp}</span>
            </div>

            <div
              className={`rounded-lg p-3.5 text-xs font-mono max-w-[92%] shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-zinc-950 font-medium'
                  : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200'
              }`}
            >
              {msg.sender === 'assistant' ? renderFormattedText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg bg-zinc-900/70 border border-zinc-800 p-3 text-xs font-mono text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Querying deterministic analytics engine & invoking Gemini...</span>
          </div>
        )}
      </div>

      {/* Canonical Quick Inquiries Bar */}
      <div className="border-t border-zinc-800 bg-zinc-950/80 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400">
          <span className="font-bold">Canonical Plant Analyst Queries:</span>
          <span>8 Standard Inquiries</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-mono">
          {canonicalInquiries.map((ci, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(ci.query)}
              disabled={isLoading}
              className="shrink-0 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 px-2.5 py-1 text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {ci.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Input Form */}
      <div className="border-t border-zinc-800 bg-zinc-950 p-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask an industrial energy question (e.g. 'What caused this alert?')..."
            disabled={isLoading}
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="mt-1 text-[9px] font-mono text-zinc-400 text-center">
          RE-TWIN AI Engine strictly cites computed numbers • Refuses mental arithmetic or data invention
        </p>
      </div>
    </div>
  );
};
