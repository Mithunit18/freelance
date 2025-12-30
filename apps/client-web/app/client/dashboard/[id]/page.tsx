'use client';

import { useEffect, useState } from 'react';
import { AppLayout, Navbar, Footer, Button, Card, Heading, Text } from '@vision-match/ui-web';
import Link from 'next/link';
import { Clock, CheckCircle, MessageCircle, Calendar, MapPin, Camera, AlertCircle, Loader } from 'lucide-react';
import { useRouter } from "next/navigation";
import { getRequestDetails } from '@/services/creatorProfile';
import { verifySession } from '@/services/clientAuth';

// Dummy data for bookings
const bookings = [
    {
        id: '1',
        creatorName: 'Vikram Singh',
        specialty: 'Product Photography',
        date: 'Dec 20, 2025',
        status: 'confirmed',
        location: 'Bangalore',
        price: '₹25,000',
    },
];

export default function DashboardPage() {
    const router = useRouter();
    
    // UI States
    const [activeTab, setActiveTab] = useState<'requests' | 'bookings'>('requests');
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    
    // Data States
    const [clientId, setClientId] = useState<string | null>(null);
    const [bookingsList, setBookingsList] = useState(bookings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Modal & Request Details States
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [requestDetails, setRequestDetails] = useState<any[]>([]); // Initialize as empty array
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Chat / Negotiation States
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ id: string; sender: 'client' | 'creator'; text: string; timestamp: Date }>>([]);
    const [messageInput, setMessageInput] = useState('');
    const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
    const [negotiatedDeliverables, setNegotiatedDeliverables] = useState('');
    const [offerFinalized, setOfferFinalized] = useState(false);

    // ------------------------------------------------------------------
    // 1. Auth Check
    // ------------------------------------------------------------------
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const user = await verifySession();
                
                if (!user) {
                    router.push("/login");
                    return;
                }

                // FIX: Ensure we get the ID correctly
                const userId = user.id || user._id || user.userId;
                console.log("User verified:", userId);
                setClientId(userId);
            } catch (err) {
                console.error("Session verification failed:", err);
                router.push("/login");
            } finally {
                setIsAuthLoading(false);
            }
        };

        checkUserSession();
    }, [router]);

    // ------------------------------------------------------------------
    // 2. Fetch Data (Improved Logic)
    // ------------------------------------------------------------------
    const fetchRequestDetails = async () => {
        if (!clientId) return;

        setLoading(true);
        setError(null);

        try {
            console.log("Fetching requests for Client ID:", clientId);
            const response = await getRequestDetails(clientId);
            console.log("API Raw Response:", response);

            // FIX: Handle different response structures
            if (Array.isArray(response)) {
                setRequestDetails(response);
            } else if (response && Array.isArray(response.data)) {
                setRequestDetails(response.data);
            } else if (response && Array.isArray(response.requests)) {
                setRequestDetails(response.requests);
            } else {
                console.warn("API response is not an array:", response);
                setRequestDetails([]); 
            }

        } catch (err: any) {
            setError(err?.message || "Failed to load request details");
            console.error("Error fetching request details:", err);
            setRequestDetails([]); // Fallback to empty
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            fetchRequestDetails();
        }
    }, [clientId]);


    // ------------------------------------------------------------------
    // 3. Helper Functions
    // ------------------------------------------------------------------
    const validateMessageContent = (text: string): { valid: boolean; error?: string } => {
        const phoneRegex = /\b\d{10}\b|\+\d{1,3}\d{9,14}/g;
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;

        if (phoneRegex.test(text)) return { valid: false, error: 'Phone numbers are not allowed.' };
        if (emailRegex.test(text)) return { valid: false, error: 'Emails are not allowed.' };
        if (linkRegex.test(text)) return { valid: false, error: 'Links are not allowed.' };

        return { valid: true };
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const validation = validateMessageContent(messageInput);
        if (!validation.valid) {
            setError(validation.error || 'Invalid message content');
            setTimeout(() => setError(null), 3000);
            return;
        }

        const newMessage = {
            id: Date.now().toString(),
            sender: 'client' as const,
            text: messageInput,
            timestamp: new Date(),
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    // ------------------------------------------------------------------
    // 4. Render Loading
    // ------------------------------------------------------------------
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="h-12 w-12 text-cyan-400 animate-spin" />
                    <Text className="text-slate-400 animate-pulse">Verifying session...</Text>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // 5. Main Render
    // ------------------------------------------------------------------
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
                    links={[
                        { href: '/', label: 'Home' },
                        { href: '/discover', label: 'Find Creators' },
                        { href: '/wizard', label: 'Start Project' },
                    ]}
                    actions={
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        </>
                    }
                />
            }
            footer={<Footer />}
        >
            <div className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <Heading level={1} className="mb-2">My Dashboard</Heading>
                    <Text className="text-slate-300 mb-8">
                        Track your project requests and manage your bookings
                    </Text>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'requests'
                                ? 'text-cyan-400 border-cyan-400'
                                : 'text-slate-400 border-transparent hover:text-white'
                                }`}
                        >
                            Project Requests ({requestDetails?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'bookings'
                                ? 'text-cyan-400 border-cyan-400'
                                : 'text-slate-400 border-transparent hover:text-white'
                                }`}
                        >
                            Confirmed Bookings ({bookingsList.length})
                        </button>
                    </div>

                    {/* Global Error State */}
                    {error && (
                        <Card className="p-4 mb-6 bg-red-500/10 border-red-500/20">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                <Text className="text-red-300">{error}</Text>
                            </div>
                        </Card>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {loading ? (
                                <Card className="p-12 text-center">
                                    <Loader className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
                                    <Text className="text-slate-400">Loading requests...</Text>
                                </Card>
                            ) : (!requestDetails || requestDetails.length === 0) ? (
                                <Card className="p-12 text-center">
                                    <Text className="text-slate-400 mb-4">No project requests yet</Text>
                                    <Button asChild>
                                        <Link href="/wizard">Find Creators</Link>
                                    </Button>
                                </Card>
                            ) : (
                                requestDetails.map((request) => (
                                    <Card key={request.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Heading level={3} className="text-xl">{request.creatorName}</Heading>
                                                    {request.status === 'pending_creator' ? (
                                                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> Pending
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> Responded
                                                        </span>
                                                    )}
                                                </div>
                                                <Text size="sm" className="text-slate-400">{request.creatorSpecialisation}</Text>
                                                <Text size="sm" className="text-slate-500">Sent {new Date(request.createdAt).toLocaleDateString()}</Text>
                                            </div>
                                            <Text className="text-xl font-bold text-cyan-400">{request.package?.price}</Text>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Camera className="h-4 w-4 text-slate-400" />
                                                <Text size="sm" className="capitalize">{request.serviceType}</Text>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <Text size="sm" className="capitalize">{request.location}</Text>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <Text size="sm">{new Date(request.eventDate).toLocaleDateString()}</Text>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedRequestId(request.id);
                                                }}
                                                disabled={detailsLoading && selectedRequestId === request.id}
                                            >
                                                View Details
                                            </Button>
                                            {request.status === 'responded' && (
                                                <Button className="flex-1 relative">
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Open Chat
                                                </Button>
                                            )}
                                            {request.status === 'negotiation_proposed' && (
                                                <Button
                                                    className="flex-1 relative"
                                                    onClick={() => setSelectedRequestId(request.id)}
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Open Chat
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="space-y-4">
                            {bookingsList.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Text className="text-slate-400 mb-4">No confirmed bookings yet</Text>
                                    <Button asChild>
                                        <Link href="/discover">Find Creators</Link>
                                    </Button>
                                </Card>
                            ) : (
                                bookingsList.map((booking) => (
                                    <Card key={booking.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Heading level={3} className="text-xl">{booking.creatorName}</Heading>
                                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Confirmed
                                                    </span>
                                                </div>
                                                <Text size="sm" className="text-slate-400">{booking.specialty}</Text>
                                            </div>
                                            <Text className="text-xl font-bold text-cyan-400">{booking.price}</Text>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <Text size="sm">{booking.date}</Text>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <Text size="sm">{booking.location}</Text>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Request Details Modal */}
                    {selectedRequestId && requestDetails && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-8">
                                    {/* Close Button */}
                                    <div className="flex items-center justify-between mb-6">
                                        <Heading level={2}>Request Details</Heading>
                                        <button
                                            onClick={() => setSelectedRequestId(null)}
                                            className="text-slate-400 hover:text-white transition-colors text-2xl"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {(() => {
                                        const selectedRequest = requestDetails.find((req: any) => req.id === selectedRequestId);
                                        if (!selectedRequest) return null;

                                        return (
                                            <>
                                                {/* Creator Info */}
                                                <div className="mb-6 pb-6 border-b border-white/10">
                                                    <Heading level={3} className="mb-3">Creator Information</Heading>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Name:</Text>
                                                            <Text className="font-semibold">{selectedRequest.creatorName}</Text>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Specialisation:</Text>
                                                            <Text className="font-semibold">{selectedRequest.creatorSpecialisation}</Text>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Package Info */}
                                                <div className="mb-6 pb-6 border-b border-white/10">
                                                    <Heading level={3} className="mb-3">Package Details</Heading>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Package Name:</Text>
                                                            <Text className="font-semibold">{selectedRequest.package?.name}</Text>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Price:</Text>
                                                            <Text className="font-semibold text-cyan-400">{selectedRequest.package?.price}</Text>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Project Info */}
                                                <div className="mb-6 pb-6 border-b border-white/10">
                                                    <Heading level={3} className="mb-3">Project Details</Heading>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Service Type:</Text>
                                                            <Text className="font-semibold capitalize">{selectedRequest.serviceType}</Text>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Location:</Text>
                                                            <Text className="font-semibold capitalize">{selectedRequest.location}</Text>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <Text className="text-slate-400">Event Date:</Text>
                                                            <Text className="font-semibold">{new Date(selectedRequest.eventDate).toLocaleDateString()}</Text>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chat/Negotiation Interface Logic */}
                                                {!chatOpen ? (
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="secondary"
                                                            className="flex-1"
                                                            onClick={() => setSelectedRequestId(null)}
                                                        >
                                                            Close
                                                        </Button>
                                                        {selectedRequest.status === 'negotiation_proposed' ? (
                                                            <Button
                                                                className="flex-1"
                                                                onClick={() => {
                                                                    setChatOpen(true);
                                                                    setNegotiatedPrice(selectedRequest.package?.price);
                                                                }}
                                                            >
                                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                                Open Chat
                                                            </Button>
                                                        ) : (
                                                            <Button className="flex-1">
                                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                                Message Creator
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Messages Area */}
                                                        <div className="border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-900/30">
                                                            {messages.length === 0 ? (
                                                                <Text className="text-slate-400 text-center py-8">No messages yet. Start negotiation!</Text>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {messages.map((msg) => (
                                                                        <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                                                            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'client' ? 'bg-cyan-600/40 text-cyan-50' : 'bg-slate-700 text-slate-100'}`}>
                                                                                <Text size="sm">{msg.text}</Text>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Pricing Inputs */}
                                                        <div className="border border-white/10 rounded-lg p-4 bg-slate-900/30">
                                                            <Heading level={4} className="mb-3 text-sm">Negotiated Price</Heading>
                                                            <input
                                                                type="number"
                                                                value={negotiatedPrice || ''}
                                                                onChange={(e) => setNegotiatedPrice(Number(e.target.value))}
                                                                placeholder="Enter price"
                                                                className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded text-white text-sm"
                                                            />
                                                        </div>

                                                        {/* Final Summary Check */}
                                                        {offerFinalized && (
                                                            <div className="border border-green-500/50 rounded-lg p-4 bg-green-500/10">
                                                                <Heading level={4} className="mb-3 text-sm text-green-400">Final Offer</Heading>
                                                                <Text className="text-green-400 font-bold">₹{negotiatedPrice}</Text>
                                                                <div className="flex gap-2 mt-4">
                                                                    <Button variant="secondary" onClick={() => setOfferFinalized(false)} className="flex-1 text-sm">Modify</Button>
                                                                    <Button className="flex-1 text-sm bg-green-600 hover:bg-green-700">Accept</Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Message Input */}
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={messageInput}
                                                                onChange={(e) => setMessageInput(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                                placeholder="Type message..."
                                                                className="flex-1 px-3 py-2 bg-slate-900 border border-white/20 rounded text-white text-sm"
                                                            />
                                                            <Button onClick={handleSendMessage} size="sm" disabled={!messageInput.trim()}>Send</Button>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <Button variant="secondary" className="flex-1" onClick={() => setChatOpen(false)}>Back</Button>
                                                            {!offerFinalized && (
                                                                <Button className="flex-1" onClick={() => setOfferFinalized(true)} disabled={!negotiatedPrice}>Finalize Offer</Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}