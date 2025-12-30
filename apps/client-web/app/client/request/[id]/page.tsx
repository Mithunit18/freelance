'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout, Navbar, Footer, Button, Card, Heading, Text } from '@vision-match/ui-web';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Calendar, Clock, MapPin, Camera, Package as PackageIcon, AlertCircle, Loader, Palette, DollarSign } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'; 
import { getCreator, Creator, requestProject } from '@/services/creatorProfile';
import { formatDate } from '../../../utils/helper';
import { useWizardStore } from '@/stores/WizardStore';
import { verifySession } from '@/services/clientAuth'; 

const NA = "Not available";

export default function RequestPage() {

    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params.id; 
    const searchParams = useSearchParams();
    
    // Local State
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [creator, setCreator] = useState<Creator | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    
    // Auth State
    const [clientId, setClientId] = useState<string | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await verifySession();
                if (!user) {
                    router.push("/login");
                    return;
                }
                setClientId(user.id);
            } catch (err) {
                console.error("Auth check failed", err);
                router.push("/login");
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    // 1. GET STORE DATA & RESET FUNCTION
    const serviceType = useWizardStore((state) => state.serviceType);
    const category = useWizardStore((state) => state.category);
    const location = useWizardStore((state) => state.location);
    const eventDate = useWizardStore((state) => state.eventDate);
    const duration = useWizardStore((state) => state.duration);
    const styleNotes = useWizardStore((state) => state.styleNotes);
    const referenceImages = useWizardStore((state) => state.referenceImages);
    const pinterestLink = useWizardStore((state) => state.pinterestLink);
    const budget = useWizardStore((state) => state.budget);
    const selectedStyles = useWizardStore((state) => state.selectedStyles);
    
    // Import the reset function
    const resetWizard = useWizardStore((state) => state.resetWizard);

    const fetchCreator = useCallback(async (creatorId: string) => {
        setLoading(true);
        setError(null);

        try {
            const creatorData = await getCreator(creatorId);
            if (!creatorData) {
                setError("Creator not found");
            }
            setCreator(creatorData);
        } catch (err) {
            console.error("Failed to fetch creator data:", err);
            setError("Unable to load creator details for request.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setHydrated(true); 
    }, []);

    useEffect(() => {
        if (id) {
            fetchCreator(id);
        } else {
            setLoading(false);
            setError("Missing Creator ID in URL.");
        }
    }, [id, fetchCreator]);
    
    // --- Package Logic ---
    const packageIndexString = searchParams.get('package');
    const selectedPackageIndex = packageIndexString ? parseInt(packageIndexString, 10) : null;

    const selectedPackage =
        creator?.packages && selectedPackageIndex !== null && !isNaN(selectedPackageIndex)
            ? creator.packages[selectedPackageIndex]
            : null;

    // --- Handle Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!creator || !selectedPackage) {
            setSubmitError("Creator or package information is missing");
            return;
        }

        if (!clientId) {
            setSubmitError("You must be logged in to send a request.");
            return;
        }

        // Basic validation
        if (!serviceType || !eventDate || !duration || !location) {
            setSubmitError("Please complete all required wizard steps before submitting");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const payload = {
                clientId: clientId,
                creatorId: creator.id,
                packageId: selectedPackage.id || selectedPackageIndex,
                packageName: selectedPackage.name,
                packagePrice: selectedPackage.price,
                
                // --- Wizard Data ---
                serviceType,
                category,
                location,
                eventDate: eventDate ? (typeof eventDate === 'string' ? eventDate : (eventDate as any).toISOString?.() || eventDate) : null,
                duration,
                budget,
                selectedStyles,
                styleNotes,
                pinterestLink,
                referenceImages: referenceImages.map(img => ({
                    id: img.id,
                    name: img.name,
                    url: img.url
                })),
                
                // --- Additional Inputs ---
                message: message || "",
                
                // --- Context Data ---
                creatorName: creator.name,
                creatorSpecialisation: creator.specialisation,
            };

            const result = await requestProject(payload);

            if (result.success) {
                setSubmitSuccess(true);
                
                // 2. CORRECT PLACE FOR RESET: Clear wizard only after successful submission
                resetWizard();

                await new Promise(resolve => setTimeout(resolve, 1500));
                router.push(`/request/${id}/sent`);
            } else {
                setSubmitError(result.error || "Failed to submit request");
            }
        } catch (err: any) {
            const errorMessage = err?.message || "An unexpected error occurred";
            setSubmitError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (!hydrated || isAuthChecking) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
    );

    // ... (Rest of your UI code remains exactly the same)
    
    if (loading) {
        return (
            <AppLayout navbar={<Navbar />} footer={<Footer />}>
                <div className="pt-40 text-center text-slate-300">
                    Loading request details...
                </div>
            </AppLayout>
        );
    }

    if (error || !creator) {
        return (
            <AppLayout navbar={<Navbar />} footer={<Footer />}>
                <div className="pt-40 text-center text-red-500">
                    {error || "Creator profile could not be loaded."}
                </div>
            </AppLayout>
        );
    }

    if (!selectedPackage) {
        return (
            <AppLayout navbar={<Navbar />} footer={<Footer />}>
                <div className="pt-40 text-center text-red-500">
                    Invalid package selected. Please go back and try again.
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
                            <span className="text-blue-500">📷</span>
                            <span className="text-white">Vision<span className="text-blue-500">Match</span></span>
                        </Link>
                    }
                />
            }
            footer={<Footer />}
        >
            <div className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link href={`/creator/${id}`} className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition">
                        <ArrowLeft className="h-4 w-4" />
                        Back to profile
                    </Link>

                    <Heading level={1} className="mb-2">Request Project</Heading>
                    <Text className="text-slate-300 mb-8">
                        Send a project request to {creator.name ?? NA}. They'll review and respond within 24 hours.
                    </Text>

                    {submitError && (
                        <Card className="p-4 mb-6 bg-red-500/10 border-red-500/20">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                <Text className="text-red-300">{submitError}</Text>
                            </div>
                        </Card>
                    )}

                    {submitSuccess && (
                        <Card className="p-4 mb-6 bg-green-500/10 border-green-500/20">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <Text className="text-green-300">Request submitted successfully! Redirecting...</Text>
                            </div>
                        </Card>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selected Package */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <PackageIcon className="h-5 w-5 text-blue-500" />
                                <Heading level={3}>Selected Package</Heading>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                                <div>
                                    <Text className="font-semibold">{selectedPackage.name} Package</Text>
                                    <Text size="sm" className="text-slate-400">{creator.specialisation ?? NA}</Text>
                                </div>
                                <Text className="text-2xl font-bold text-blue-500">{selectedPackage.price}</Text>
                            </div>
                        </Card>

                        {/* Project Details from Wizard */}
                        <Card className="p-6">
                            <Heading level={3} className="mb-4">Your Project Details</Heading>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                                    <Camera className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <Text size="sm" className="text-slate-400">Service & Category</Text>
                                        <Text className="capitalize">{serviceType} {category && `• ${category}`}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <Text size="sm" className="text-slate-400">Location</Text>
                                        <Text>{location || creator?.location?.city || "Not Specified"}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <Text size="sm" className="text-slate-400">Date</Text>
                                        <Text>{formatDate(eventDate)}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <Text size="sm" className="text-slate-400">Duration</Text>
                                        <Text>{duration ? `${duration} hours` : selectedPackage?.duration || "Not Specified"}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <Text size="sm" className="text-slate-400">Budget Range</Text>
                                        <Text className="capitalize">{budget || "Not Specified"}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                                    <Palette className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <Text size="sm" className="text-slate-400">Preferences</Text>
                                        <Text>{selectedStyles.length} styles selected</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Additional Message */}
                        <Card className="p-6">
                            <label className="block mb-2">
                                <Heading level={4} className="mb-2">Additional Message (Optional)</Heading>
                                <Text size="sm" className="text-slate-400 mb-4">
                                    Share any specific requirements or questions
                                </Text>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={6}
                                placeholder="Example: We're planning an outdoor ceremony at sunset..."
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-pink-500 focus:outline-none transition resize-none"
                            />
                        </Card>

                        {/* Important Info */}
                        <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                            <div className="flex gap-3">
                                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <Heading level={4} className="mb-2">What happens next?</Heading>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        <li>• Your request will be sent to {creator.name ?? NA}</li>
                                        <li>• They'll review and respond within 24 hours</li>
                                        <li>• No payment required until you both agree on terms</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                                className="flex-1"
                                disabled={submitting}
                            >
                                Go Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || submitSuccess}
                                className="flex-1"
                            >
                                {submitting ? 'Sending...' : submitSuccess ? 'Sent Successfully' : 'Send Request'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}