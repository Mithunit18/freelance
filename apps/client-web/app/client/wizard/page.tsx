'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Sparkles, Send, RotateCcw, Menu, X, AlertCircle, Lightbulb, MessageCircle, Target, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Auth } from '@/services/Auth';
import { palette } from '@/utils/theme';
import { createSession, sendChatMessage, deleteSession } from '@/services/chat';
import type { Message, Creator, Stage } from '@/types/chat';
import { Header } from '@/components/layout/Header';

// Creator Card Component
const CreatorCard = ({ creator }: { creator: Creator }) => {
  const getCreatorColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'videographer': return 'from-purple-500 to-indigo-600';
      case 'photographer': return 'from-pink-500 to-rose-600';
      case 'editor': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="group bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200/80 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-100/30 transition-all duration-500">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${getCreatorColor(creator.type)} rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0`}
        >
          {creator.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate">{creator.name}</h4>
            {creator.match_score && (
              <div className="shrink-0 px-2.5 py-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-full text-xs font-bold shadow-md">
                {creator.match_score}% Match
              </div>
            )}
          </div>
          <p className="text-pink-600 font-semibold text-xs sm:text-sm capitalize">{creator.type}</p>
          {creator.location && (
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">📍 {creator.location}</p>
          )}
        </div>
      </div>

      {creator.styles && creator.styles.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">Specialties</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {creator.styles.slice(0, 4).map((style, i) => (
              <span
                key={i}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-pink-50 to-blue-50 text-gray-700 rounded-lg text-xs font-medium border border-pink-100/50 hover:border-pink-200 transition-colors"
              >
                {style}
              </span>
            ))}
            {creator.styles.length > 4 && (
              <span className="px-2.5 py-1 text-gray-400 text-xs">+{creator.styles.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {creator.budget_range && (
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <p className="text-xs text-gray-500 mb-0.5">Budget Range</p>
          <p className="text-green-700 font-bold text-sm sm:text-base">{creator.budget_range}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          {creator.budget_range || 'Contact for pricing'}
        </span>
        <button className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
          View Profile
        </button>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.type === 'user';
  
  // Try to parse creators from message content
  let creators: Creator[] = [];
  let displayContent = message.content;
  
  if (!isUser) {
    try {
      const jsonMatch = message.content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          creators = parsed;
          displayContent = message.content.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
        }
      }
    } catch {
      // Not JSON, display as normal text
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600"
            : "bg-gradient-to-br from-pink-500 to-rose-500"
        }`}
      >
        {isUser ? (
          <span className="text-white text-xs sm:text-sm font-bold">You</span>
        ) : (
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        )}
      </div>
      
      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl sm:rounded-3xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 shadow-lg ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
              : "bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-100 shadow-xl"
          }`}
        >
          <p className="text-xs sm:text-sm md:text-base leading-relaxed font-medium break-words whitespace-pre-line">
            {displayContent}
          </p>
        </div>
        
        {creators.length > 0 && (
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {creators.map((creator, index) => (
              <CreatorCard key={creator.id || index} creator={creator} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose, onRestart }: { isOpen: boolean; onClose: () => void; onRestart: () => void }) => {
  const tips = [
    { icon: Target, text: "Be specific about your event type" },
    { icon: Clock, text: "Mention your timeline & dates" },
    { icon: CheckCircle2, text: "Share your budget range" },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '100%' }}
        className={`fixed right-0 top-0 h-full w-72 sm:w-80 bg-white/95 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl z-50 lg:static lg:translate-x-0 lg:w-72 lg:block ${!isOpen && 'hidden lg:block'}`}
      >
        <div className="p-4 sm:p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-bold text-gray-900">Quick Help</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 sm:p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800 text-sm">Pro Tip</span>
            </div>
            <p className="text-yellow-700 text-xs sm:text-sm">
              The more details you share, the better matches you'll get!
            </p>
          </div>

          <button
            onClick={onRestart}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Quick Tips</h4>
            </div>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-blue-50/50 transition-all duration-300">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <tip.icon className="w-3 h-3 text-pink-600" />
                  </div>
                  <span className="text-gray-600 text-xs sm:text-sm">{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default function WizardPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Chat state
  const [stage, setStage] = useState<Stage>('landing');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await Auth.me();
        if (!user) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.push("/login");
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async () => {
    setIsTransitioning(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await createSession();
      setSessionId(response.session_id);
      
      setTimeout(() => {
        setStage('chat');
        setMessages([{
          id: '1',
          type: 'bot',
          content: response.message,
          timestamp: new Date()
        }]);
        setIsTransitioning(false);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to start session. Please try again.');
      setIsTransitioning(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(sessionId, userMessage.content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);

      // Check if we have creator recommendations
      if (response.message.includes('```json')) {
        try {
          const jsonMatch = response.message.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const creators = JSON.parse(jsonMatch[1]);
            if (Array.isArray(creators) && creators.length > 0) {
              // Store creators for discover page and redirect
              localStorage.setItem('recommended_creators', JSON.stringify(creators));
              setTimeout(() => {
                router.push('/client/discover');
              }, 3000);
            }
          }
        } catch {
          // Continue normally if parsing fails
        }
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setStage('landing');
      setSessionId(null);
      setMessages([]);
      setError(null);
      setIsTransitioning(false);
    }, 300);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: palette.bgGradient }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-30 rounded-full" style={{ backgroundColor: palette.pink }} />
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ background: palette.ctaGradient }}>
              <Loader className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Preparing your creative journey...</p>
        </motion.div>
      </div>
    );
  }

  // Landing Stage
  if (stage === 'landing') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.pink }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20" style={{ backgroundColor: palette.blue }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[250px] opacity-10" style={{ backgroundColor: palette.purple }} />
        </div>
        
        <Header />
        
        <main className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-200 bg-white/90 backdrop-blur-sm mb-8 shadow-lg shadow-pink-100/50"
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-bold text-pink-600">AI-Powered Matching</span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              style={{ background: palette.ctaGradient }}
            >
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4">
              Find Your{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Perfect Creator
              </span>
            </h1>
            
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
              Tell our AI assistant about your project and we'll match you with the perfect photographer or videographer.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 max-w-md mx-auto"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChat}
              disabled={isLoading}
              className="group px-10 py-5 text-white rounded-full text-lg font-bold shadow-2xl hover:shadow-pink-300/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: palette.ctaGradient }}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <Loader className="w-5 h-5 animate-spin" />
                  Starting...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Begin Your Journey
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Chat Stage
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: palette.bgGradient }}>
      <Header />
      
      <div className="flex-1 flex pt-16 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="relative border-b border-gray-200/50 shadow-lg backdrop-blur-xl z-20 overflow-hidden px-4 sm:px-6 py-3 sm:py-4 bg-white/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: palette.ctaGradient }}>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                    Vision Match AI
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Finding your perfect creative match</p>
                </div>
              </div>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: palette.ctaGradient }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/90 rounded-2xl px-5 py-4 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-xl p-3 sm:p-4 md:p-5">
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Tell me about your project..."
                  rows={1}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none text-sm sm:text-base placeholder-gray-400 transition-all duration-300"
                  style={{ minHeight: '50px', maxHeight: '120px' }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shrink-0"
                style={{ background: palette.ctaGradient }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}