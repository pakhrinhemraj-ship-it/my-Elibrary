import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Compass, 
  Cpu, 
  BookOpen, 
  Globe,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Greetings, Subscriber! I am CyberLibrarian, your digital collection synthetic assistant.\n\nI have complete catalog indexing. Ask me for recommendations or scan for existing in-stock classic and sci-fi books here!",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || inputVal;
    if (!promptText.trim()) return;

    if (!textToSend) {
      setInputVal("");
    }

    // Append user message
    const updatedMessages = [
      ...messages,
      { role: "user", text: promptText, timestamp: new Date() }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", { prompt: promptText });
      
      if (response.success && response.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: response.data.text,
            sources: response.data.sources || [],
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error("Empty response details");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to communicate with AI model.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Core connectivity interruption. The neural net was unable to return query coordinates. Ensure your key works or retry in moments.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Interactive registers cleared. Ask me about books currently in stock, or request global trends search!",
        timestamp: new Date()
      }
    ]);
  };

  const quickPrompts = [
    { label: "Scan In-house Books", prompt: "Summarize what books are physically inside this library catalog and which ones are currently available?" },
    { label: "Recommend Sci-Fi", prompt: "Recommend a great science fiction book from the live catalog, and give me a brief hook for it." },
    { label: "Suggest Classics", prompt: "Recommend a timeless Classics book from the stock library." },
    { label: "Search Web Trends", prompt: "What are the top 3 best-selling fantasy or self-help books printed in 2025/2026? Ground your answers using Google Search." }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Upper Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan/10 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron flex items-center gap-2.5">
            AI <span className="text-cyan">LIBRARIAN</span> <Sparkles className="h-5 w-5 text-cyan animate-pulse" />
          </h2>
          <p className="font-outfit text-xs text-muted mt-1 leading-normal">
            Converse with CyberLibrarian, explore automated index recommendations, and lookup search-grounded book reviews.
          </p>
        </div>
        <button
          onClick={clearChat}
          className="self-end md:self-auto px-4 py-2 bg-red/5 hover:bg-red/15 border border-red/20 hover:border-red/55 rounded-xl text-xs font-semibold text-red uppercase tracking-wide cursor-pointer transition-all flex items-center space-x-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Clear Coordinates</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Quick Help & Suggestion Drawer Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 border border-cyan/15 space-y-4">
            <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan" /> ARCHIVE COMMANDS
            </h3>
            <p className="font-outfit text-[11px] text-muted leading-relaxed">
              CyberLibrarian analyzes the whole stock database. Trigger instant lookups below by selecting quick registers files.
            </p>

            <div className="space-y-2.5 pt-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.prompt)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl border border-cyan/5 bg-surface/30 hover:bg-cyan/10 hover:border-cyan/35 text-xs text-text transition-all font-outfit disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center space-x-2"
                >
                  <BookOpen className="h-3.5 w-3.5 text-cyan shrink-0 animate-pulse" />
                  <span className="leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 border border-cyan/15 space-y-3 bg-[#0d0d1a]/40">
            <h4 className="font-orbitron font-bold text-[10px] text-cyan tracking-wider uppercase">Librarian Capabilities</h4>
            <ul className="text-[10px] font-outfit text-muted space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Automatic catalog search synchronizations</li>
              <li>Genre trend analytics and suggestions</li>
              <li>Google Search grounding enabled</li>
              <li>No key requirements loaded on local client endpoints</li>
            </ul>
          </div>
        </div>

        {/* Primary Interactive Chat Console */}
        <div className="lg:col-span-3 flex flex-col h-[65vh] glass-card border border-cyan/15 overflow-hidden">
          {/* Chat feed viewport container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-surface/10 scrollbar-none">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => {
                const isBot = m.role === "assistant";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-3`}
                  >
                    {/* Role Icon */}
                    {isBot && (
                      <div className="h-8 w-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shrink-0 shadow-sm mt-0.5 animate-pulse">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                    )}

                    {/* Chat Bubble card */}
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-outfit leading-relaxed border shadow-md ${
                      isBot 
                        ? "bg-surface border-cyan/10 text-text rounded-tl-none" 
                        : "bg-cyan/10 border-cyan/20 text-white rounded-tr-none font-medium ml-auto"
                    }`}>
                      <div className="whitespace-pre-line prose prose-invert max-w-none">
                        {m.text}
                      </div>

                      {/* Display search references / citations */}
                      {isBot && m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-cyan/10 space-y-1">
                          <p className="font-orbitron font-bold text-[9px] text-[#00f5ff]/80 tracking-widest uppercase flex items-center gap-1.5">
                            <Globe className="h-3 w-3 animate-spin-slow text-cyan" /> Grounding References:
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px]">
                            {m.sources.map((src, srcIdx) => (
                              <a
                                key={srcIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 bg-surface border border-cyan/10 hover:border-cyan/50 text-cyan px-2 py-0.5 rounded transition-all"
                              >
                                <span>{src.title || "Source"}</span>
                                <Compass className="h-2.5 w-2.5 text-cyan" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[8px] font-mono text-muted/65 text-right mt-2 select-none">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {!isBot && (
                      <div className="h-8 w-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center text-violet shrink-0 shadow-sm mt-0.5">
                        <User className="h-4.5 w-4.5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Neural Net Processing skeleton block */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start items-start gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shrink-0 animate-pulse">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="glass-card max-w-[85%] border border-cyan/10 bg-surface p-4 rounded-2xl rounded-tl-none space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-3.5 w-3.5 text-cyan animate-spin" />
                    <span className="font-orbitron text-[9px] text-cyan font-bold tracking-widest uppercase animate-pulse">
                      LIBRARIAN SYNAPSES TRANSDUCTING...
                    </span>
                  </div>
                  <div className="space-y-1.5 w-52 max-w-full">
                    <div className="h-2 w-full bg-cyan/10 rounded animate-pulse"></div>
                    <div className="h-2 w-5/6 bg-cyan/10 rounded animate-pulse"></div>
                    <div className="h-2 w-4/5 bg-cyan/10 rounded animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Prompt Entry Box Command Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-cyan/15 bg-[#050510]/50 flex items-center gap-3"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
              placeholder="Ask CyberLibrarian or type catalog inquiry details..."
              className="flex-1 bg-surface border border-cyan/15 focus:border-cyan/45 focus:outline-none rounded-xl px-4 py-3 text-xs font-outfit text-text placeholder-muted disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="p-3 bg-cyan text-[#05050f] rounded-xl hover:shadow-neon-cyan active:scale-95 transition-all disabled:opacity-30 disabled:hover:shadow-none cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
