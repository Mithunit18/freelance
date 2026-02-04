"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  Camera,
  Upload,
  X,
  Edit3,
  Save,
  Building,
  Heart,
  Shield,
  Star,
  Award,
  Verified,
  Globe,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Auth } from "@/services/Auth";
import { clientOnboardingService } from "@/services/clientOnboarding";
import { Header } from "@/components/layout/Header";

// ============== PALETTE ==============
const palette = {
  pink: "#ec4899",
  pink600: "#db2777",
  purple: "#a855f7",
  blue: "#3b82f6",
  blue600: "#2563eb",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray800: "#1f2937",
  emerald: "#059669",
  amber: "#f59e0b",
  bgGradient: "linear-gradient(135deg, #fdf2f8 0%, #eff6ff 50%, #f5f3ff 100%)",
  brandGradient: "linear-gradient(135deg, #ec4899, #a855f7, #3b82f6)",
  ctaGradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
  cardGradient: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
};

// ============== TYPES ==============
interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  profilePhoto: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation: string;
  companyName: string;
  preferredCategories: string[];
}

// ============== CATEGORY OPTIONS ==============
const categoryOptions = [
  { id: "wedding", label: "Wedding", emoji: "💒", color: "#ec4899" },
  { id: "portrait", label: "Portrait", emoji: "📸", color: "#8b5cf6" },
  { id: "commercial", label: "Commercial", emoji: "🏢", color: "#3b82f6" },
  { id: "event", label: "Events", emoji: "🎉", color: "#f59e0b" },
  { id: "product", label: "Product", emoji: "📦", color: "#10b981" },
  { id: "fashion", label: "Fashion", emoji: "👗", color: "#ec4899" },
  { id: "travel", label: "Travel", emoji: "✈️", color: "#06b6d4" },
  { id: "food", label: "Food", emoji: "🍽️", color: "#f97316" },
];

// Gender display mapping
const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

// ============== ANIMATED CARD COMPONENT ==============
const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={hover ? { y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" } : {}}
    className={`bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

// ============== INFO FIELD COMPONENT ==============
const InfoField = ({
  icon: Icon,
  label,
  value,
  iconColor,
  isEditing,
  editComponent,
}: {
  icon: any;
  label: string;
  value: string;
  iconColor: string;
  isEditing: boolean;
  editComponent?: React.ReactNode;
}) => (
  <div className="group">
    <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block text-gray-400">
      {label}
    </label>
    {isEditing && editComponent ? (
      editComponent
    ) : (
      <div className="flex items-center gap-3 h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100 group-hover:border-gray-200 transition-all">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <span className="text-gray-700 font-medium">{value || "Not set"}</span>
      </div>
    )}
  </div>
);

export default function ClientProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    profilePhoto: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    occupation: "",
    companyName: "",
    preferredCategories: [],
  });

  const [editedData, setEditedData] = useState<ProfileData>(profileData);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await Auth.me();
        if (!userData?.user) {
          router.replace("/login");
          return;
        }

        setUserEmail(userData.user.email);

        // Load client profile data
        const clientData = await clientOnboardingService.get();
        if (clientData) {
          const profile: ProfileData = {
            fullName: clientData.full_name || userData.user.name || "",
            email: clientData.email || userData.user.email || "",
            phoneNumber: clientData.phone_number || "",
            gender: clientData.gender || "",
            dateOfBirth: clientData.date_of_birth || "",
            profilePhoto: clientData.profile_photo || "",
            address: clientData.address || "",
            city: clientData.city || "",
            state: clientData.state || "",
            pincode: clientData.pincode || "",
            occupation: clientData.occupation || "",
            companyName: clientData.company_name || "",
            preferredCategories: clientData.preferred_categories || [],
          };
          setProfileData(profile);
          setEditedData(profile);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await clientOnboardingService.uploadProfilePhoto(file);
      setEditedData((prev) => ({ ...prev, profilePhoto: imageUrl }));
      toast.success("Profile photo uploaded!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setEditedData((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(categoryId)
        ? prev.preferredCategories.filter((c) => c !== categoryId)
        : [...prev.preferredCategories, categoryId],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: editedData.fullName,
        phone_number: editedData.phoneNumber,
        gender: editedData.gender,
        date_of_birth: editedData.dateOfBirth,
        profile_photo: editedData.profilePhoto,
        address: editedData.address,
        city: editedData.city,
        state: editedData.state,
        pincode: editedData.pincode,
        occupation: editedData.occupation,
        company_name: editedData.companyName,
        preferred_categories: editedData.preferredCategories,
      };

      await clientOnboardingService.update(payload);
      setProfileData(editedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: palette.bgGradient }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div
              className="absolute inset-0 blur-3xl opacity-30 rounded-full"
              style={{ backgroundColor: palette.pink }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              style={{ background: palette.ctaGradient }}
            >
              <Loader2 className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: palette.bgGradient }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: palette.pink }}
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: palette.blue }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10"
          style={{ backgroundColor: palette.purple }}
        />
      </div>

      <Header />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium mb-8 hover:opacity-80 transition-all group"
          style={{ color: palette.gray600 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Gradient Banner */}
          <div
            className="h-48 sm:h-56 rounded-3xl overflow-hidden relative"
            style={{ background: palette.brandGradient }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Edit/Save Buttons */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="h-11 px-5 rounded-xl bg-white/20 backdrop-blur-md text-white font-semibold border border-white/30 hover:bg-white/30 transition-all shadow-lg"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="save"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-2"
                  >
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="h-11 rounded-xl bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="h-11 px-5 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-100 transition-all shadow-lg"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile Photo & Name */}
          <div className="absolute -bottom-16 left-6 sm:left-10 flex items-end gap-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                {(isEditing ? editedData.profilePhoto : profileData.profilePhoto) ? (
                  <img
                    src={isEditing ? editedData.profilePhoto : profileData.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: palette.brandGradient }}
                  >
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: palette.pink }} />
                    ) : (
                      <Camera className="w-5 h-5" style={{ color: palette.pink }} />
                    )}
                  </motion.button>
                  {(isEditing ? editedData.profilePhoto : profileData.profilePhoto) && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditedData((prev) => ({ ...prev, profilePhoto: "" }))}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </>
              )}
              
              {/* Verified Badge */}
              <div
                className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: palette.ctaGradient }}
              >
                <Verified className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Name & Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 mb-8 px-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {profileData.fullName || "Your Name"}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </span>
                {profileData.city && profileData.state && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {profileData.city}, {profileData.state}
                  </span>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-3">
              {profileData.occupation && (
                <div
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                  style={{ backgroundColor: `${palette.blue}15`, color: palette.blue }}
                >
                  <Briefcase className="w-4 h-4" />
                  {profileData.occupation}
                </div>
              )}
              <div
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                style={{ backgroundColor: `${palette.emerald}15`, color: palette.emerald }}
              >
                <Shield className="w-4 h-4" />
                Verified Client
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Info Cards */}
          <div className="space-y-6">
            {/* Stats Card */}
            <AnimatedCard delay={0.1} className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Crown className="w-5 h-5" style={{ color: palette.amber }} />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-pink-50/50 rounded-xl">
                  <span className="text-sm text-gray-600">Interests</span>
                  <span className="font-bold" style={{ color: palette.pink }}>
                    {profileData.preferredCategories.length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl">
                  <span className="text-sm text-gray-600">Profile Status</span>
                  <span className="font-bold text-emerald-600">Complete</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-bold" style={{ color: palette.purple }}>2024</span>
                </div>
              </div>
            </AnimatedCard>

            {/* Contact Card */}
            <AnimatedCard delay={0.2} className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: palette.blue }} />
                Contact Info
              </h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${profileData.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${palette.pink}15` }}
                  >
                    <Mail className="w-5 h-5" style={{ color: palette.pink }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {profileData.email}
                    </p>
                  </div>
                </a>
                <a
                  href={`tel:${profileData.phoneNumber}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${palette.blue}15` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: palette.blue }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-gray-700">
                      {profileData.phoneNumber || "Not set"}
                    </p>
                  </div>
                </a>
              </div>
            </AnimatedCard>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <AnimatedCard delay={0.15} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${palette.pink}20, ${palette.purple}20)` }}
                >
                  <User className="w-5 h-5" style={{ color: palette.pink }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                  <p className="text-sm text-gray-500">Your basic profile details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoField
                  icon={User}
                  label="Full Name"
                  value={profileData.fullName}
                  iconColor={palette.pink}
                  isEditing={isEditing}
                  editComponent={
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: palette.pink }}
                      />
                      <Input
                        className="h-12 pl-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-pink-200"
                        value={editedData.fullName}
                        onChange={(e) =>
                          setEditedData({ ...editedData, fullName: e.target.value })
                        }
                      />
                    </div>
                  }
                />

                <InfoField
                  icon={Phone}
                  label="Mobile Number"
                  value={profileData.phoneNumber}
                  iconColor={palette.blue}
                  isEditing={isEditing}
                  editComponent={
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: palette.blue }}
                      />
                      <Input
                        type="tel"
                        className="h-12 pl-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-blue-200"
                        value={editedData.phoneNumber}
                        onChange={(e) =>
                          setEditedData({ ...editedData, phoneNumber: e.target.value })
                        }
                      />
                    </div>
                  }
                />

                <InfoField
                  icon={Heart}
                  label="Gender"
                  value={genderLabels[profileData.gender] || "Not set"}
                  iconColor={palette.purple}
                  isEditing={isEditing}
                  editComponent={
                    <select
                      className="h-12 w-full px-4 rounded-2xl border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      value={editedData.gender}
                      onChange={(e) =>
                        setEditedData({ ...editedData, gender: e.target.value })
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  }
                />

                <InfoField
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(profileData.dateOfBirth)}
                  iconColor={palette.amber}
                  isEditing={isEditing}
                  editComponent={
                    <div className="relative">
                      <Calendar
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: palette.amber }}
                      />
                      <Input
                        type="date"
                        className="h-12 pl-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-amber-200"
                        value={editedData.dateOfBirth}
                        onChange={(e) =>
                          setEditedData({ ...editedData, dateOfBirth: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  }
                />
              </div>
            </AnimatedCard>

            {/* Address */}
            <AnimatedCard delay={0.2} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${palette.purple}20, ${palette.blue}20)` }}
                >
                  <MapPin className="w-5 h-5" style={{ color: palette.purple }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Address</h3>
                  <p className="text-sm text-gray-500">Your location information</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block text-gray-400">
                    Street Address
                  </label>
                  {isEditing ? (
                    <textarea
                      className="w-full min-h-[100px] px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none text-sm"
                      value={editedData.address}
                      onChange={(e) =>
                        setEditedData({ ...editedData, address: e.target.value })
                      }
                      placeholder="Enter your street address..."
                    />
                  ) : (
                    <div className="flex items-start gap-3 min-h-[52px] px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: palette.purple }} />
                      <span className="text-gray-700">{profileData.address || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block text-gray-400">
                      City
                    </label>
                    {isEditing ? (
                      <Input
                        className="h-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-purple-200"
                        value={editedData.city}
                        onChange={(e) =>
                          setEditedData({ ...editedData, city: e.target.value })
                        }
                        placeholder="City"
                      />
                    ) : (
                      <div className="h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100 flex items-center">
                        <span className="text-gray-700">{profileData.city || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block text-gray-400">
                      State
                    </label>
                    {isEditing ? (
                      <Input
                        className="h-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-purple-200"
                        value={editedData.state}
                        onChange={(e) =>
                          setEditedData({ ...editedData, state: e.target.value })
                        }
                        placeholder="State"
                      />
                    ) : (
                      <div className="h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100 flex items-center">
                        <span className="text-gray-700">{profileData.state || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block text-gray-400">
                      Pincode
                    </label>
                    {isEditing ? (
                      <Input
                        className="h-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-purple-200"
                        maxLength={6}
                        value={editedData.pincode}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            pincode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="Pincode"
                      />
                    ) : (
                      <div className="h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100 flex items-center">
                        <span className="text-gray-700">{profileData.pincode || "Not set"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Professional Info */}
            <AnimatedCard delay={0.25} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${palette.blue}20, ${palette.emerald}20)` }}
                >
                  <Briefcase className="w-5 h-5" style={{ color: palette.blue }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Professional Information</h3>
                  <p className="text-sm text-gray-500">Your work details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block text-gray-400">
                    Occupation
                  </label>
                  {isEditing ? (
                    <select
                      className="h-12 w-full px-4 rounded-2xl border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      value={editedData.occupation}
                      onChange={(e) =>
                        setEditedData({ ...editedData, occupation: e.target.value })
                      }
                    >
                      <option value="">Select Occupation</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Marketing Professional">Marketing Professional</option>
                      <option value="Event Planner">Event Planner</option>
                      <option value="Student">Student</option>
                      <option value="Corporate Employee">Corporate Employee</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Influencer/Content Creator">Influencer/Content Creator</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-3 h-12 px-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${palette.blue}15` }}
                      >
                        <Briefcase className="w-4 h-4" style={{ color: palette.blue }} />
                      </div>
                      <span className="text-gray-700">{profileData.occupation || "Not set"}</span>
                    </div>
                  )}
                </div>

                <InfoField
                  icon={Building}
                  label="Company/Organization"
                  value={profileData.companyName}
                  iconColor={palette.emerald}
                  isEditing={isEditing}
                  editComponent={
                    <div className="relative">
                      <Building
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: palette.emerald }}
                      />
                      <Input
                        className="h-12 pl-12 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-emerald-200"
                        value={editedData.companyName}
                        onChange={(e) =>
                          setEditedData({ ...editedData, companyName: e.target.value })
                        }
                        placeholder="Company name"
                      />
                    </div>
                  }
                />
              </div>
            </AnimatedCard>

            {/* Interests */}
            <AnimatedCard delay={0.3} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${palette.pink}20, ${palette.amber}20)` }}
                >
                  <Star className="w-5 h-5" style={{ color: palette.pink }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Your Interests</h3>
                  <p className="text-sm text-gray-500">Types of photography/videography you&apos;re interested in</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categoryOptions.map((category) => {
                  const isSelected = isEditing
                    ? editedData.preferredCategories.includes(category.id)
                    : profileData.preferredCategories.includes(category.id);

                  return (
                    <motion.button
                      key={category.id}
                      type="button"
                      onClick={() => isEditing && handleCategoryToggle(category.id)}
                      disabled={!isEditing}
                      whileHover={isEditing ? { scale: 1.02 } : {}}
                      whileTap={isEditing ? { scale: 0.98 } : {}}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? "bg-white shadow-lg"
                          : "bg-gray-50/50 border-transparent hover:bg-white/50"
                      } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                      style={{
                        borderColor: isSelected ? category.color : "transparent",
                      }}
                    >
                      <span className="text-3xl">{category.emoji}</span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: isSelected ? palette.gray800 : palette.gray500,
                        }}
                      >
                        {category.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
}
