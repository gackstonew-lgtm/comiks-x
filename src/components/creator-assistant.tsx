"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Lightbulb } from "lucide-react";

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
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-[0_4px_16px_rgba(62,207,142,0.3)] transition-all group focus-visible:outline-brand focus-visible:outline-2"
        title="AI Creator Assistant"
        aria-label="Toggle AI Director Copilot"
      >
        <Sparkles className="w-4 h-4 stroke-[2.2] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">AI Director Copilot</span>
      </button>

      {/* Floating Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 sm:right-5 z-50 w-[92vw] sm:w-[400px] max-h-[540px] h-[500px] flex flex-col bg-[#1c1c1c] border border-[#2e2e2e] rounded-[8px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#2e2e2e] bg-[#171717] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-[4px] bg-brand/15 border border-brand/25 flex items-center justify-center text-brand font-bold">
                <Bot className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#ededed]">AI Director Copilot</h4>
                <div className="text-[10px] text-brand flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Studio Context
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-[4px] text-[#707070] hover:text-[#ededed] hover:bg-[#232323] transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs hide-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-2.5 rounded-[6px] max-w-[85%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-brand text-[#09090b] font-medium"
                      : "bg-[#171717] border border-[#2e2e2e] text-[#ededed]"
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
                        className="text-[10px] px-2 py-1 rounded-[4px] bg-[#171717] hover:bg-[#232323] border border-[#2e2e2e] hover:border-brand/40 text-brand text-left flex items-center gap-1 transition-colors"
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
              <div className="flex items-center space-x-2 text-[11px] text-[#a0a0a0] bg-[#171717] p-2 rounded-[6px] border border-[#2e2e2e] w-fit">
                <Sparkles className="w-3.5 h-3.5 text-brand animate-spin" />
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
            className="p-3 border-t border-[#2e2e2e] bg-[#171717] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about scene pacing, Sheng, model routing..."
              className="flex-1 bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-2.5 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-medium disabled:opacity-40 transition-all"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
