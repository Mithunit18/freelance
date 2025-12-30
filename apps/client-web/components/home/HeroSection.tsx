"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button, Heading, Text } from "@vision-match/ui-web";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">✨ AI-Powered Creative Matching</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <Heading level={1} className="mb-3 leading-tight">
              Find Your Perfect
            </Heading>
            <Heading level={1} gradient className="leading-tight">
              Creative Partner
            </Heading>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Text size="xl" className="max-w-3xl mx-auto text-slate-300">
              Connect with elite photographers and videographers through our intelligent 
              matching algorithm. Your vision, their expertise, perfect results.
            </Text>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button size="lg" asChild>
              <Link href="/wizard" className="group inline-flex items-center gap-2 px-8 py-4">
                Start Your Project
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/discover" className="px-8 py-4">
                Browse Creators
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 border-2 border-slate-950 flex items-center justify-center"
                  />
                ))}
              </div>
              <span className="text-sm font-medium">≈2,000+ Verified Creators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-lg">★</span>
              <span className="text-sm font-medium">★4.9/5 Average Rating</span>
            </div>
            <div className="text-sm font-medium">
              10,000+ Projects Completed
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
