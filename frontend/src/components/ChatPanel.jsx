import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

export default function ChatPanel({ isOpen, onClose, ticker, reportMarkdown, rawContextData, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [contextSource, setContextSource] = useState('report');
  const messagesEndRef = useRef(null);

  // Reset messages when ticker changes
  useEffect(() => {
    if (ticker) {
      setMessages([
        { role: 'assistant', content: `I've analyzed **${ticker}**. Ask me anything about the report — accounting adjustments, peer comparisons, risk factors, or hidden signals.` }
      ]);
    }
  }, [ticker]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !reportMarkdown) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          report_markdown: reportMarkdown,
          raw_data: rawContextData,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          api_key: apiKey,
          context_source: contextSource
        })
      });

      if (!response.ok) throw new Error('Failed to start chat stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentReply = '';
      let buffer = '';
      let currentEvent = '';

      // Initialize the assistant message
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'message') {
                currentReply += data.text;
                // Update the last message
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: currentReply };
                  return updated;
                });
              } else if (currentEvent === 'error') {
                console.error('Chat error:', data.message);
              }
            } catch (e) {
              console.error("Failed to parse chat SSE data", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, I encountered an error answering your question.' };
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  };

    return (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 420, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="h-full bg-zinc-950 flex flex-col border-l border-zinc-800/60 z-20 flex-shrink-0"
      >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Analyst</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">{ticker ? `Discussing ${ticker}` : 'Chat'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={contextSource} 
                  onChange={(e) => setContextSource(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded-lg px-2 py-1 focus:outline-none focus:border-rose-500/50"
                  title="Context Source"
                >
                  <option value="report">Report</option>
                  <option value="raw">Raw Data</option>
                  <option value="both">Both</option>
                </select>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                  )}
                  
                  {msg.role === 'user' ? (
                      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-rose-600/80 text-white rounded-tr-md">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="text-sm space-y-2 [&_strong]:text-white [&_strong]:font-semibold [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_ul]:space-y-1 [&_li]:text-zinc-300 [&_table]:w-full [&_table]:text-xs [&_th]:text-zinc-400 [&_th]:font-semibold [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-b [&_th]:border-zinc-700 [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-zinc-800 [&_tr:hover]:bg-zinc-800/30">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700 mt-0.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isSending && messages[messages.length - 1]?.role !== 'assistant' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 justify-start"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                    <Bot className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-zinc-800/60 flex gap-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors glow-focus"
                disabled={isSending || !reportMarkdown}
                id="chat-input"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-all duration-200 shadow-lg shadow-rose-500/15"
                id="chat-send-button"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
    );
}
