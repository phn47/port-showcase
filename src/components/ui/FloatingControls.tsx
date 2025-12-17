
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageSquare, X, Send } from 'lucide-react';

// --- CHAT INTERFACE COMPONENT ---
const ChatInterface = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    { text: "Welcome to 9F Universe. How can we elevate your vision today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // Add User Message
    setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
    setInputValue("");

    // Simulate Auto-Response (Echo for now)
    setTimeout(() => {
        setMessages(prev => [...prev, { 
            text: "Thank you for reaching out. An agent will be with you shortly.", 
            isUser: false 
        }]);
    }, 1000);
  };

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-28 right-4 md:right-8 z-[50] w-[calc(100vw-2rem)] md:w-96 h-[500px] bg-white border-2 border-black rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto font-sans"
    >
        {/* Header */}
        <div className="bg-black text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight uppercase">9F SUPPORT</span>
                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> ALWAYS ONLINE
                </span>
            </div>
            <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
                <X size={18} />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
            <div className="text-center py-4 opacity-30">
                <span className="text-4xl font-black text-black">9F</span>
            </div>
            
            {messages.map((msg, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[85%] p-3 text-sm leading-relaxed ${
                        msg.isUser 
                        ? 'bg-black text-white rounded-2xl rounded-br-none' 
                        : 'bg-white text-black border border-gray-200 rounded-2xl rounded-bl-none shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </motion.div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all text-black placeholder:text-gray-400 font-mono"
            />
            <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
                <Send size={16} className={inputValue.trim() ? "ml-0.5" : ""} />
            </button>
        </form>
    </motion.div>
  );
};

// --- MAIN FLOATING CONTROLS ---
const FloatingControls: React.FC = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      // Show scroll button after passing the hero section (approx 800px)
      if (window.scrollY > 800) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
        {/* Buttons Layer (With Mix Blend) */}
        <div className="fixed bottom-8 right-8 z-[40] flex flex-col gap-4 pointer-events-none mix-blend-difference text-white">
        
            {/* Chat Trigger Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                onClick={toggleChat}
                className={`pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full border border-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                    isChatOpen ? 'bg-white text-black rotate-0 scale-110' : 'bg-transparent hover:bg-white hover:text-black'
                }`}
                data-hover="true"
                data-cursor-text={isChatOpen ? "CLOSE" : "CHAT"}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isChatOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={20} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageSquare size={20} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Scroll To Top Button */}
            <AnimatePresence>
                {showScroll && (
                <motion.button
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={scrollToTop}
                    className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full border border-white bg-white text-black flex items-center justify-center transition-transform duration-300 hover:scale-110"
                    data-hover="true"
                    data-cursor-text="TOP"
                >
                    <ArrowUp size={24} />
                </motion.button>
                )}
            </AnimatePresence>
        </div>

        {/* Chat Interface Layer (No Mix Blend) */}
        <AnimatePresence>
            {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
        </AnimatePresence>
    </>
  );
};

export default FloatingControls;
