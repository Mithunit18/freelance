'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Navbar, Footer, Button, Card, Heading, Text } from '@vision-match/ui-web';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Camera,
  Award,
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2,
  Package,
  Shield,
  Calendar,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { getCreator } from '@/services/creatorProfile'; // Assumed path

// src/types/creator.ts
export type CreatorPackage = {
  name: string;
  price: string;
  duration: string;
  deliverables?: string[];
  popular?: boolean;
};

export type Creator = {
  id: string;
  name?: string;
  role?: string;
  profileImage?: string;
  specialisation?: string;
  rating?: number;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  tags?: string[];
  verified?: boolean;
  experience?: string;
  completedProjects?: number;
  reviews?: {
    userId: string;
    rating: number;
    comment?: string;
  }[];

  portfolioImages?: string[];
  gear?: string[];
  packages?: CreatorPackage[];
};

const NA = "Not available";


function useCreatorData(id: string | undefined) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const fetchCreatordata = useCallback(async (creatorId: string) => {
    // Reset state before new fetch
    setLoading(true);
    setError(null);
    setCreator(null); // Clear previous data

    try {
      const creatorData = await getCreator(creatorId); // Creator | null

      if (!creatorData) {
        setError("Creator not found");
        setCreator(null);
      } else {
        setCreator(creatorData);
      }
    } catch (err) {
      console.error("Failed to fetch creator:", err);
      setError("Unable to load creator details due to a network or server error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCreatordata(id);
    } else {
      setLoading(false);
      setError("No creator ID provided.");
    }
  }, [id, fetchCreatordata]);

  return { creator, loading, error };
}


export default function CreatorProfilePage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { creator, loading, error } = useCreatorData(id);

  // --- Render Logic ---

  if (loading) {
    return (
      <AppLayout navbar={<Navbar />} footer={<Footer />}>
        <div className="pt-40 text-center text-slate-300">
          Loading creator profile...
        </div>
      </AppLayout>
    );
  }

  // Handle both external errors (network, timeout) and internal (404/not found)
  if (error || !creator) {
    const displayError = error || "Creator profile could not be loaded.";
    return (
      <AppLayout navbar={<Navbar />} footer={<Footer />}>
        <div className="pt-40 text-center text-red-500">
          {displayError}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      navbar={
        <Navbar
          logo={
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-cyan-400">📷</span>
              <span className="text-white">Vision<span className="text-cyan-400">Match</span></span>
            </Link>
          }
        />
      }
      footer={<Footer />}
    >
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/discover" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to discover
          </Link>

          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Heading level={1} className="text-4xl">
                      {creator.name ?? NA}
                    </Heading>
                    {creator.verified && (
                      <CheckCircle className="h-6 w-6 text-cyan-400" />
                    )}
                  </div>
                  <Text size="lg" className="text-slate-300">
                    {creator.specialisation ?? NA}
                  </Text>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">
                        {creator.rating ?? "N/A"}
                      </span>
                      <span className="text-slate-400">
                        ({creator.reviews?.length ?? 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      {creator.location
                        ? `${creator.location.city}, ${creator.location.country}`
                        : NA}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="p-4 text-center">
                  <Award className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <Text size="sm" className="text-slate-400">Experience</Text>
                  <Text className="font-semibold">
                    {creator.experience ?? "—"}
                  </Text>
                </Card>

                <Card className="p-4 text-center">
                  <Camera className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <Text size="sm" className="text-slate-400">Projects</Text>
                  <Text className="font-semibold">
                    {creator.completedProjects ? `${creator.completedProjects}+` : "—"}
                  </Text>
                </Card>

                <Card className="p-4 text-center">
                  <Shield className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <Text size="sm" className="text-slate-400">Status</Text>
                  <Text className="font-semibold text-cyan-400">
                    {creator.verified ? "Verified" : "Not verified"}
                  </Text>
                </Card>

              </div>

              {/* About */}
              <Card className="p-6 mb-8">
                <Heading level={3} className="mb-4">About</Heading>
                <Text className="text-slate-300 leading-relaxed">
                  {creator.bio || "No description available"}
                </Text>

                <div className="flex flex-wrap gap-2 mt-4">
                  {creator.tags?.length ? (
                    creator.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <Text size="sm" className="text-slate-400">
                      No tags available
                    </Text>
                  )}
                </div>
              </Card>

              {/* Portfolio */}
              <div className="mb-8">
                <Heading level={3} className="mb-6">Portfolio</Heading>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {creator.portfolioImages?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {creator.portfolioImages.map((img, index) => (
                        <motion.div
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden bg-slate-800"
                        >
                          <img 
                            src={creator.profileImage} // Using profile image as placeholder for demonstration
                            alt={`Portfolio image ${index + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Text className="text-slate-400">
                      Portfolio not available
                    </Text>
                  )}

                </div>
              </div>

              {/* Gear */}
              <Card className="p-6">
                <Heading level={3} className="mb-4">Equipment</Heading>
                <div className="flex flex-wrap gap-2">
                  {creator.gear?.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Packages Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Heading level={3} className="mb-6">Packages</Heading>
                <div className="space-y-4">
                  {creator.packages?.length ? (
                    creator.packages.map((pkg, index) => (
                      <Card
                        key={index}
                        className={`p-6 cursor-pointer transition-all ${selectedPackage === index
                          ? 'border-cyan-500 ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-950'
                          : 'hover:border-cyan-500/50'
                          } ${pkg.popular ? 'border-cyan-500/50' : ''}`}
                        onClick={() => setSelectedPackage(index)}
                      >
                        {pkg.popular && (
                          <span className="inline-block px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full mb-3">
                            Most Popular
                          </span>
                        )}
                        <div className="flex items-baseline justify-between mb-4">
                          <Heading level={4} className="text-xl">{pkg.name}</Heading>
                          <Text className="text-2xl font-bold text-cyan-400">{pkg.price}</Text>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 mb-4">
                          <Calendar className="h-4 w-4" />
                          <Text size="sm">{pkg.duration}</Text>
                        </div>
                        <ul className="space-y-2">
                          {pkg.deliverables?.map((item, i) => ( // Use optional chaining on deliverables
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6 text-center">
                      <Text className="text-slate-400">No packages available.</Text>
                    </Card>
                  )}
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={selectedPackage === null}
                  asChild={selectedPackage !== null && creator.id !== undefined}
                >
                  {selectedPackage !== null && creator.id !== undefined ? (
                    <Link href={`/request/${creator.id}?package=${selectedPackage}`}>
                      Request for Project
                    </Link>
                  ) : (
                    'Select a package'
                  )}
                </Button>

                <Text size="sm" className="text-center text-slate-400 mt-4">
                  You'll send a request, not an instant booking
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}