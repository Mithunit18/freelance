'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@vision-match/ui-web"; 
import { cn } from "@vision-match/utils-js"; 
import { Auth} from '@/services/Auth'; // Import our auth services

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/client/discover', label: 'Find Creators' },
  { href: '/client/wizard', label: 'Start Project' },
  { href: '/', label: 'How It Works' },
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
      const userData = await Auth.me();
      setUser(userData);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // 2. Handle Logout
  const handleLogout = async () => {
    await Auth.logout();
    setUser(null);
    setIsProfileOpen(false);
    router.refresh();
  };

  // 3. Determine Dashboard URL based on Role
  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.user.role === 'client' ? `/client/dashboard/${user.user.email}` : '/creator/dashboard';
  };
  const getprofilelink = () => {
    if (!user) return '/login';
    return user.user.role === 'client' ? '/client/profile' : '/creator/profile';
  };
  return (
    
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50 bg-gradient-to-r from-pink-500 to-blue-500">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-gray-800">
              Vision<span className="text-pink-500">Match</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  pathname === link.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
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
              <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              // LOGGED IN STATE
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-gray-200 hover:border-pink-300 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.user.name || "User"}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden py-1"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-xs font-medium text-pink-500 truncate">{user.email}</p>
                      </div>
                      <Link 
                        href={getDashboardLink()}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link 
                        href={getprofilelink()}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
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
                <Button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100" variant="ghost">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="rounded-xl px-6 font-bold text-white shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 hover:scale-105 transition-all bg-gradient-to-r from-pink-500 to-blue-500 border-0">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
                        ? "text-pink-500 bg-pink-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-gray-200 my-2" />
                
                {user ? (
                  <>
                     <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Button variant="ghost" className="w-full justify-start text-gray-600">
                       <Link href="/login">Sign In</Link>
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white">
                       <Link href="/signup">Get Started</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}