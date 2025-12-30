'use client';

import { motion } from 'framer-motion';
import { AppLayout, Navbar, Footer, Button, Card, Heading, Text } from '@vision-match/ui-web';
import Link from 'next/link';
import { CheckCircle, MessageCircle, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { verifySession } from '@/services/clientAuth'; // Import Auth Service

export default function RequestSentPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // 1. Fetch User ID securely from session
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const user = await verifySession();
            if (user) {
                setCurrentUserId(user.id);
            }
        } catch (error) {
            console.error("Failed to verify session", error);
        }
    };
    fetchUser();
  }, []);

  return (
    <AppLayout
      navbar={
        <Navbar
          logo={
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-blue-500">📷</span>
              <span className="text-white">Vision<span className="text-blue-500">Match</span></span>
            </Link>
          }
        />
      }
      footer={<Footer />}
    >
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="h-12 w-12 text-blue-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Heading level={1} gradient className="mb-4">
              Request Sent Successfully!
            </Heading>
            <Text size="lg" className="text-slate-300 mb-12 max-w-lg mx-auto">
              Your project request has been sent. The creator will review your details and respond within 24 hours.
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            <Card className="p-6 text-center">
              <Bell className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <Heading level={4} className="mb-2 text-lg">Stay Notified</Heading>
              <Text size="sm" className="text-slate-400">
                We'll email you when the creator responds
              </Text>
            </Card>

            <Card className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <Heading level={4} className="mb-2 text-lg">Discuss Details</Heading>
              <Text size="sm" className="text-slate-400">
                Chat with the creator to finalize everything
              </Text>
            </Card>

            <Card className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <Heading level={4} className="mb-2 text-lg">Book & Pay</Heading>
              <Text size="sm" className="text-slate-400">
                Secure your booking once terms are agreed
              </Text>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Only show this button if we have the User ID */}
            {currentUserId && (
                <Button size="lg" asChild>
                <Link href={`/dashboard/${currentUserId}`}>
                    View My Requests
                </Link>
                </Button>
            )}
            
            <Button size="lg" variant="secondary" asChild>
              <Link href="/discover">
                Browse More Creators
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Text size="sm" className="text-slate-400">
              Questions? <Link href="/help" className="text-blue-500 hover:text-blue-400">Contact Support</Link>
            </Text>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}