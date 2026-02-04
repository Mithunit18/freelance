"use client";

import { useState, useEffect, useRef } from "react";
import { 
  CreditCard, Instagram, CheckCircle2, Clock, 
  Upload, Shield, Loader2, ArrowLeft, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { verificationService, onboardingService } from "@/services/onboarding";

const VerificationOnboarding = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeUpload, setActiveUpload] = useState<{ id: string; type: string } | null>(null);
  const [verifications, setVerifications] = useState({ id_card: "not_started", social_links: "not_started" });

  // Palette from guidelines - utilizing high-contrast neutrals [cite: 64, 65]
  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    emerald: "#059669",
    gray800: "#1f2937", // Deepest gray for headings 
    gray600: "#4b5563", // Secondary text 
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)", // [cite: 50]
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)" // [cite: 46]
  };

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await verificationService.getStatus();
        if (data?.verification_documents) {
          const docs = data.verification_documents;
          setVerifications({
            id_card: docs.some((d: any) => d.verification_type === 'id_card') ? "submitted" : "not_started",
            social_links: docs.some((d: any) => d.verification_type === 'social_links') ? "submitted" : "not_started",
          });
        }
      } catch (e) { 
        console.error("Session load failed", e); 
      } finally { 
        setFetching(false); 
      }
    };
    loadStatus();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeUpload) return;

    const loadingToast = toast.loading("Securely uploading document...");
    
    try {
      const uploadRes = await verificationService.uploadDocument(file);
      await verificationService.submit({
        verification_type: activeUpload.type, 
        document_url: uploadRes.url
      });
      
      setVerifications(prev => ({ ...prev, [activeUpload.id]: "submitted" }));
      toast.success("Document submitted for review", { id: loadingToast });
    } catch (err: unknown) {
      toast.error("Upload failed. Please try again.", { id: loadingToast });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "submitted") return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[11px] uppercase tracking-wider font-bold">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>
    );
    if (status === "verified") return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px] uppercase tracking-wider font-bold">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
      </Badge>
    );
    return <Badge variant="outline" className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Incomplete</Badge>;
  };

  if (fetching) return (
    <div className="flex h-screen items-center justify-center bg-[#f9fafb]">
      <Loader2 className="animate-spin" style={{ color: palette.pink }} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: palette.bgGradient }}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="w-20 h-20 rounded-4xl bg-white shadow-xl flex items-center justify-center mx-auto mb-8 border border-white"
          >
            <ShieldCheck className="w-10 h-10" style={{ color: palette.purple }} />
          </motion.div>
          
          {/* OPTIMISED FONT: Larger size, tighter tracking for youth appeal */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4" style={{ color: palette.gray800 }}>
            Identity <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Verification</span>
          </h1>
          <p className="text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto" style={{ color: palette.gray600 }}>
            Quick check to unlock projects and build trust with clients.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5">
          {[
            { id: "id_card", type: "id_card", title: "Government ID", icon: CreditCard, desc: "Aadhaar, PAN, or Passport", color: palette.blue },
            { id: "social_links", type: "social_links", title: "Social Proof", icon: Instagram, desc: "Instagram or Portfolio", color: palette.pink }
          ].map((opt) => (
            <Card key={opt.id} className="group p-8 bg-white/70 backdrop-blur-2xl border-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 rounded-3xl transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${opt.color}15` }}>
                    <opt.icon className="w-8 h-8" style={{ color: opt.color }} />
                  </div>
                  <div>
                    {/* OPTIMISED FONT: Bold and visible */}
                    <h3 className="text-2xl font-black mb-1" style={{ color: palette.gray800 }}>{opt.title}</h3>
                    <p className="text-md font-medium mb-3" style={{ color: palette.gray600 }}>{opt.desc}</p>
                    {getStatusBadge(verifications[opt.id as keyof typeof verifications])}
                  </div>
                </div>
                
                {verifications[opt.id as keyof typeof verifications] === "not_started" && (
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 rounded-2xl border-2 font-bold text-md hover:bg-white transition-all active:scale-95"
                    style={{ borderColor: "#e5e7eb", color: palette.gray800 }}
                    onClick={() => { setActiveUpload({ id: opt.id, type: opt.type }); fileInputRef.current?.click(); }}
                  >
                    <Upload className="w-5 h-5 mr-2" /> Upload Document
                  </Button>
                )}
              </div>
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20" style={{ background: opt.color }} />
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 gap-6">
          <Button 
            variant="ghost" 
            className="text-md font-bold hover:bg-transparent px-0" 
            style={{ color: palette.gray600 }}
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
          </Button>
          
          <Button 
            disabled={loading}
            className="w-full sm:w-auto px-12 h-16 rounded-3xl text-white text-lg font-black shadow-2xl hover:shadow-pink-200 transition-all active:scale-95 group overflow-hidden relative"
            style={{ background: palette.brandGradient }}
            onClick={async () => { 
              setLoading(true); 
              await onboardingService.complete(); 
              router.push("/creator/onboarding/complete"); 
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
               {loading ? <Loader2 className="animate-spin" /> : "Finish Profile"}
            </span>
          </Button>
        </div>
        
        <p className="text-center text-sm font-bold uppercase tracking-widest mt-12 opacity-40 flex items-center justify-center gap-2" style={{ color: palette.gray800 }}>
          <Shield className="w-4 h-4" /> Military-grade encryption
        </p>
      </motion.div>
    </div>
  );
};

export default VerificationOnboarding;