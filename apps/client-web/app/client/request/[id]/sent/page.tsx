'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, MessageCircle, Bell, ArrowRight, Home, Clock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { verifySession } from '@/services/clientAuth';
import { Header } from '@/components/layout/Header';
import { cn } from '@vision-match/utils-js';

// Brand palette matching landing page
const palette = {
  pink: "#ec4899",
  purple: "#a855f7",
  blue: "#3b82f6",
  bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
};

// Confetti particles
const ConfettiParticle = ({ delay, index }: { delay: number; index: number }) => {
  const colors = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
  const color = colors[index % colors.length];
  const startX = Math.random() * 100;
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{ 
        backgroundColor: color,
        left: `${startX}%`,
        top: -10,
      }}
      initial={{ y: -20, opacity: 1, scale: 1 }}
      animate={{ 
        y: '100vh', 
        opacity: 0, 
        scale: 0.5,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
      }}
      transition={{ 
        duration: 3 + Math.random() * 2, 
        delay,
        ease: "easeOut",
      }}
    />
  );
};

export default function RequestSentPage() {
  const params = useParams<{ id: string }>();
  const creatorId = params.id;
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await verifySession();
        if (user) {
          // Use email as the user identifier since that's what the auth system returns
          setCurrentUserId(user.email || user.id);
        }
      } catch (error) {
        console.error("Failed to verify session", error);
      }
    };
    fetchUser();
    
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Animated Background Elements */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 h-[800px] w-[800px] rounded-full opacity-30"
        style={{ background: palette.pink, filter: "blur(180px)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-32 -right-32 h-[800px] w-[800px] rounded-full opacity-30"
        style={{ background: palette.blue, filter: "blur(180px)" }}
      />
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: palette.purple, filter: "blur(200px)" }}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(30)].map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.1} index={i} />
          ))}
        </div>
      )}

      <Header />

      <main className="relative pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.5 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-20 rounded-full scale-150" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200/50">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Request Sent!
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-12 max-w-md mx-auto">
              Your project request has been sent to the creator. They will review your details and respond within 24-48 hours.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            {[
              { icon: Bell, title: 'Stay Notified', desc: "We'll email you when they respond", color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200' },
              { icon: MessageCircle, title: 'Discuss Details', desc: 'Chat to finalize your project', color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50', border: 'border-purple-200' },
              { icon: CheckCircle, title: 'Book & Pay', desc: 'Secure booking when ready', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={cn(
                  "p-6 rounded-2xl border text-center backdrop-blur-sm",
                  item.bg, item.border
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center",
                  item.color
                )}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* What Happens Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 mb-8 text-left shadow-lg shadow-gray-100/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-500" />
              What happens next?
            </h3>
            <ol className="space-y-3">
              {[
                'Creator reviews your request and project details',
                'They will accept, decline, or propose changes',
                'If negotiation is needed, you can chat within the platform',
                'Once agreed, proceed to secure payment',
                'Booking confirmed - you\'re all set!'
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {currentUserId && (
              <Link
                href={`/client/dashboard/${currentUserId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-200/50 transition-all"
              >
                <Sparkles className="h-5 w-5" />
                View My Requests
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            
            <Link
              href="/client/discover"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Home className="h-5 w-5" />
              Browse More Creators
            </Link>
          </motion.div>

          {/* Support Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-sm text-gray-500"
          >
            Questions?{' '}
            <Link href="/help" className="text-pink-500 hover:text-pink-600 font-medium">
              Contact Support
            </Link>
          </motion.p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">VisionMatch</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}