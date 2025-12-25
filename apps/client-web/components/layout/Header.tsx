'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@vision-match/ui-web"; 
import { cn } from "@vision-match/utils-js"; 
import { verifySession, logout } from '@/services/clientAuth'; // Import our auth services

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Find Creators' },
  { href: '/wizard', label: 'Start Project' },
  { href: '/how-it-works', label: 'How It Works' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // 1. Check Login Status on Mount
  useEffect(() => {
    const checkAuth = async () => {
      const userData = await verifySession();
      setUser(userData);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // 2. Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsProfileOpen(false);
    router.refresh();
  };

  // 3. Determine Dashboard URL based on Role
  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'client' ? `/dashboard/${user.id}` : '/creator/dashboard';
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4"
    >
      <div className="mx-auto max-w-7xl">
        {/* Glass Card Container */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-white/10 rounded-2xl shadow-xl px-6 py-3">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-500/40 transition-colors duration-500" />
                <Camera className="relative h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                Vision<span className="text-cyan-400">Match</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    pathname === link.href
                      ? "text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons / Profile Menu */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                // Loading Skeleton
                <div className="h-9 w-24 bg-white/5 rounded-lg animate-pulse" />
              ) : user ? (
                // LOGGED IN STATE
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">
                      {user.name || "User"}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden py-1"
                      >
                        <div className="px-4 py-2 border-b border-white/5">
                            <p className="text-xs text-slate-500">Signed in as</p>
                            <p className="text-xs font-medium text-cyan-400 truncate">{user.email}</p>
                        </div>
                        <Link 
                          href={getDashboardLink()}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link 
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // LOGGED OUT STATE
                <>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 border-0" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <nav className="flex flex-col gap-1 pt-4 pb-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "text-cyan-400 bg-cyan-950/30"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="h-px bg-white/5 my-2" />
                  
                  {user ? (
                    <>
                       <Link
                        href={getDashboardLink()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      <Button variant="ghost" className="w-full justify-start text-slate-300" asChild>
                         <Link href="/login">Sign In</Link>
                      </Button>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-500" asChild>
                         <Link href="/signup">Get Started</Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}