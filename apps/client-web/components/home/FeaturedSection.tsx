"use client";

import { motion } from 'framer-motion';
import { Brain, Shield, MessageSquare, Zap, Camera, Award } from 'lucide-react';
import { Heading, Text, Card } from '@vision-match/ui-web';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Our intelligent algorithm analyzes your style preferences and project needs to find creators who match your vision perfectly.',
  },
  {
    icon: Camera,
    title: 'Curated Portfolios',
    description: 'Browse through carefully vetted portfolios featuring only the best work from verified photographers and videographers.',
  },
  {
    icon: MessageSquare,
    title: 'Seamless Communication',
    description: 'Chat directly with creators, share mood boards, and negotiate terms all within our secure platform.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Protected milestone-based payments ensure your money is safe until you\'re completely satisfied with the deliverables.',
  },
  {
    icon: Zap,
    title: 'Quick Turnaround',
    description: 'Find and book your perfect creative partner in minutes, not weeks. Most projects get matched within 24 hours.',
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'Every creator is thoroughly vetted and reviewed. If you\'re not satisfied, our dispute resolution team has your back.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-cyan-400 font-medium mb-4 block"
          >
            Why Vision Match
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heading level={2} className="mb-2">
              The Smarter Way to Find
            </Heading>
            <Heading level={2} gradient>
              Creative Talent
            </Heading>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <Text size="lg" className="max-w-2xl mx-auto">
              We've reimagined how clients and creators connect, using technology 
              to make the process faster, safer, and more effective.
            </Text>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="p-6 group hover:border-cyan-500/40 transition-all h-full">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <Heading level={4} className="mb-2 text-xl">
                  {feature.title}
                </Heading>
                <Text>
                  {feature.description}
                </Text>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
