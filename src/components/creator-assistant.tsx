"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, Lightbulb } from "lucide-react";

interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  suggestedActions?: string[];
}

export function CreatorAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Sasa! I am your Comiks X AI Studio Assistant. I can help optimize your 30-minute scene pacing, verify Nairobi cultural nuances, improve hook retention, and configure AI video model routing.",
      suggestedActions: [
        "Optimize scene pacing for 30-min episode",
        "Verify Sheng & Swahili code-switching",
        "Explain video provider fallback chain",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const assistantMsg: AssistantMessage = {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: data.answer || "I processed your request with the production pipeline.",
          suggestedActions: data.suggestedActions || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "assistant",
            text: "Sorry, I ran into an error accessing studio diagnostics. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "Network error communicating with Creator Platform Assistant.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-black text-xs shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all group"
        title="AI Creator Assistant"
      >
        <Sparkles className="w-4 h-4 stroke-[2.5] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">AI Director Copilot</span>
      </button>

      {/* Slide-Up Floating Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[560px] h-[520px] flex flex-col bg-studio-900/95 backdrop-blur-xl border border-studio-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-studio-800/80 bg-studio-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-comic-yellow to-amber-500 flex items-center justify-center text-studio-950 font-black">
                <Bot className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">AI Director Copilot</h4>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Studio Context
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-studio-400 hover:text-white hover:bg-studio-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-medium rounded-tr-sm"
                      : "bg-studio-950 border border-studio-800 text-studio-200 rounded-tl-sm"
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Suggested Action Chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {m.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-studio-950 hover:bg-studio-800 border border-studio-800 hover:border-comic-yellow/50 text-comic-yellow text-left flex items-center gap-1 transition-colors"
                      >
                        <Lightbulb className="w-2.5 h-2.5" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-[11px] text-studio-400 bg-studio-950 p-2.5 rounded-xl border border-studio-800 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-comic-yellow animate-spin" />
                <span>Consulting AI Director & Continuity Engine...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-studio-800 bg-studio-950/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask copilot about pacing, Sheng slang, model routing..."
              className="flex-1 bg-studio-900 border border-studio-800 rounded-xl px-3 py-2 text-xs text-white placeholder-studio-500 focus:outline-none focus:border-comic-yellow"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-bold disabled:opacity-40 hover:scale-105 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
