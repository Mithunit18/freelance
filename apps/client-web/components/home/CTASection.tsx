"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Heading, Text } from "@vision-match/ui-web";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 via-slate-900/50 to-cyan-600/10" />
          <div className="absolute inset-0 gradient(ellipse_at_top_right,rgba(6,182,212,0.3),transparent_50%)]`" />
          
          {/* Content */}
          <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Heading level={2} className="mb-2">
                Ready to Find Your
              </Heading>
              <Heading level={2} gradient>
                Perfect Creator?
              </Heading>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto mb-8"
            >
              <Text size="lg">
                Start your creative brief in minutes and let our AI match you 
                with the best photographers and videographers for your project.
              </Text>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild>
                <Link href="/wizard" className="group">
                  Start Free Brief
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Text size="sm" className="text-slate-400">
                No credit card required
              </Text>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
