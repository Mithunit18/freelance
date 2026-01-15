'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Auth } from '@/services/Auth';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

// --- Local UI Components ---
const Input = ({ icon: Icon, className = '', ...props }: any) => (
  <div className="relative group">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
    )}
    <input
      className={`flex h-12 w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 pl-10 text-sm text-gray-800 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 transition-all ${className}`}
      {...props}
    />
  </div>
);

const Button = ({ children, className = '', disabled, loading, ...props }: any) => {
  return (
    <button 
      className={`relative inline-flex items-center justify-center rounded-xl font-bold transition-all h-12 px-6 py-2 disabled:opacity-50 text-white shadow-lg active:scale-95 overflow-hidden group ${className}`} 
      disabled={disabled || loading}
      style={{ background: 'linear-gradient(to right, #ec4899, #3b82f6)' }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
      </span>
      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
    </button>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    gray600: "#4b5563",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)"
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await Auth.me();
        if (data && data.user) {
          const { role, onboarding_completed, email } = data.user;
          console.log('User role:', role, 'Onboarding completed:', onboarding_completed);

          // For clients, go to dashboard
          if (role === "client") {
            router.replace(`/client/dashboard/${encodeURIComponent(email)}`);
          } else {
            // For creators (photographer/videographer/both/creator), check onboarding status
            const targetPath = onboarding_completed ? "/creator/dashboard" : "/creator/onboarding";
            router.replace(targetPath);
          }
        } else {
          setIsCheckingAuth(false);
        }
      } catch (err: unknown) {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await Auth.login({
        email: formData.email,
        password: formData.password,
      });
      if (data && data.user) {
        toast.success("Welcome back!");
        
        // For clients, go to dashboard
        if (data.user.role === "client") {
          router.push(`/client/dashboard/${encodeURIComponent(data.user.email)}`);
        } else {
          // For creators, check if onboarding is completed
          // After login, we need to fetch the full user data to check onboarding status
          const meData = await Auth.me();
          const onboardingCompleted = meData?.user?.onboarding_completed;
          const target = onboardingCompleted ? "/creator/dashboard" : "/creator/onboarding";
          router.push(target);
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      toast.error(axiosError?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: palette.purple }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm" style={{ color: palette.pink }}>
              <Sparkles className="w-3 h-3" /> Secure Access
            </div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight text-gray-800">
              Welcome <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Back</span>
            </h1>
            <p style={{ color: palette.gray600 }}>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>Email Address</label>
              <Input 
                icon={Mail}
                type="email" 
                value={formData.email} 
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="name@company.com" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>Password</label>
              <Input 
                icon={Lock}
                type="password" 
                value={formData.password} 
                onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-400"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <span className="text-sm font-medium transition-colors group-hover:text-gray-800" style={{ color: palette.gray600 }}>Remember me</span>
              </label>
              <Link href="/forgot-password" hidden className="text-sm font-bold hover:underline" style={{ color: palette.blue }}>
                Forgot?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium" style={{ color: palette.gray600 }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: palette.blue }}>
              Create an account
            </Link>
          </div>
        </div>
        
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] mt-8 opacity-40 text-gray-500">
          Powered by VisionMatch AI
        </p>
      </motion.div>
    </div>
  );
}