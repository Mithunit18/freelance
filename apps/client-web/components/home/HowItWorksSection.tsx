"use client";

import { motion } from 'framer-motion';
import { ClipboardList, Palette, Users, Handshake } from 'lucide-react';
import { Heading, Text } from '@vision-match/ui-web';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Share Your Vision',
    description: 'Tell us about your project through our guided wizard. Event type, location, budget, and timeline.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Pick Your Style',
    description: 'Browse curated style images and select the ones that resonate with your aesthetic preferences.',
  },
  {
    number: '03',
    icon: Users,
    title: 'Get Matched',
    description: 'Our AI analyzes your preferences and connects you with creators whose work aligns perfectly.',
  },
  {
    number: '04',
    icon: Handshake,
    title: 'Book & Create',
    description: 'Review portfolios, chat with creators, finalize terms, and bring your vision to life.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-cyan-400 font-medium mb-4 block"
          >
            How It Works
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heading level={2} className="mb-2">
              From Brief to Booking
            </Heading>
            <Heading level={2} gradient>
              In Minutes
            </Heading>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-linear-to-r from-cyan-500/50 to-transparent" />
              )}
              
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 text-center relative">
                {/* Step Number */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-cyan-400 bg-slate-950 px-3 py-1 rounded-full border border-cyan-500/30">
                  {step.number}
                </span>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="h-8 w-8 text-cyan-400" />
                </div>
                
                <Heading level={4} className="mb-2 text-xl">
                  {step.title}
                </Heading>
                <Text size="sm">
                  {step.description}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
