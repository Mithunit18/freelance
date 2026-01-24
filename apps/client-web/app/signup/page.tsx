'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Auth } from '@/services/Auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Check, Loader2, 
  Camera, Video, Briefcase, Sparkles, ArrowRight 
} from 'lucide-react';

// --- Local UI Components ---
const Input = ({ icon: Icon, className = '', ...props }: any) => (
  <div className="relative group">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
    )}
    <input
      className={`flex h-12 w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 pl-10 text-sm text-gray-800 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:opacity-50 transition-all ${className}`}
      {...props}
    />
  </div>
);

const Button = ({ children, className = '', disabled, loading, ...props }: any) => (
  <button 
    className={`relative inline-flex items-center justify-center rounded-xl font-bold transition-all h-12 px-6 py-2 disabled:opacity-50 text-white shadow-lg active:scale-95 overflow-hidden group ${className}`} 
    disabled={disabled || loading}
    style={{ background: 'linear-gradient(to right, #ec4899, #3b82f6)' }}
    {...props}
  >
    <span className="relative z-10 flex items-center gap-2">
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </span>
    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
  </button>
);

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    role: '' 
  });
  const [loading, setLoading] = useState(false);

  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    gray600: "#4b5563",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)"
  };

  const roles = [
    { id: 'client', label: 'Client', icon: Briefcase, desc: 'I want to hire', color: palette.blue },
    { id: 'photographer', label: 'Photographer', icon: Camera, desc: 'I capture stills', color: palette.pink },
    { id: 'videographer', label: 'Videographer', icon: Video, desc: 'I create films', color: palette.purple },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!formData.role) {
      toast.error("Please select a role.");
      return;
    }

    setLoading(true);
    try {
      const data = await Auth.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role, 
      });
      toast.success("Account created successfully!");
      // Navigate based on role - client goes to wizard, creators go to onboarding
      const userRole = data.user?.role || formData.role;
      router.push(userRole === 'client' ? '/client/wizard' : '/creator/onboarding');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      toast.error(axiosError?.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: palette.bgGradient }}>
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-pink-100/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm" style={{ color: palette.pink }}>
              <Sparkles className="w-3 h-3" /> Join the community
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-800">
              Create your <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>Account</span>
            </h1>
            <p style={{ color: palette.gray600 }}>Start your creative journey with us today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>I am a...</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${
                      formData.role === role.id ? 'bg-white shadow-md' : 'bg-white/40 border-transparent hover:bg-white/60'
                    }`}
                    style={{ borderColor: formData.role === role.id ? role.color : 'transparent' }}
                  >
                    <role.icon className="w-6 h-6 mb-1 transition-transform group-hover:scale-110" style={{ color: role.color }} />
                    <span className="text-sm font-bold text-gray-800">{role.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{role.desc}</span>
                    {formData.role === role.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4" style={{ color: role.color }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>Full Name</label>
                <Input icon={User} type="text" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>Email</label>
                <Input icon={Mail} type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>Password</label>
                <Input icon={Lock} type="password" value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" minLength={8} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: palette.gray600 }}>Confirm</label>
                <Input icon={Check} type="password" value={formData.confirmPassword} onChange={(e: any) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" minLength={8} required />
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400" required />
              <span className="text-xs leading-relaxed" style={{ color: palette.gray600 }}>
                I agree to the <Link href="/terms" className="font-bold hover:underline" style={{ color: palette.blue }}>Terms</Link> and 
                <Link href="/privacy" className="font-bold ml-1 hover:underline" style={{ color: palette.blue }}>Privacy Policy</Link>
              </span>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Create Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 text-center text-sm font-medium" style={{ color: palette.gray600 }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold hover:underline" style={{ color: palette.blue }}>
              Sign in
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