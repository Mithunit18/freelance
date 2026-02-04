"use client";

import { useState, useEffect } from "react";
import {
  Landmark,
  Building2,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Shield,
  Info,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { bankDetailsService, BankDetailsPayload, IFSCValidationResponse } from "@/services/onboarding";

const BankDetailsOnboarding = () => {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
  });

  // Bank info from IFSC validation
  const [bankInfo, setBankInfo] = useState<{
    bankName: string;
    branchName: string;
    address: string;
    city: string;
    state: string;
  } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [validatingIFSC, setValidatingIFSC] = useState(false);
  const [ifscValid, setIfscValid] = useState<boolean | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingDetails, setExistingDetails] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Palette
  const palette = {
    pink: "#ec4899",
    purple: "#a855f7",
    blue: "#3b82f6",
    amber: "#f59e0b",
    emerald: "#059669",
    gray800: "#1f2937",
    gray600: "#4b5563",
    gray400: "#9ca3af",
    bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
    brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
  };

  // Load existing bank details on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const status = await bankDetailsService.getStatus();
        if (status.has_bank_details && status.bank_details) {
          setAlreadySubmitted(true);
          setExistingDetails(status.bank_details);
        }
      } catch (error) {
        console.error("Error loading bank status:", error);
      } finally {
        setFetching(false);
      }
    };
    loadExistingData();
  }, []);

  // Validate IFSC code
  const handleIFSCValidation = async () => {
    const ifsc = formData.ifscCode.trim().toUpperCase();
    
    if (ifsc.length !== 11) {
      toast.error("IFSC code must be exactly 11 characters");
      return;
    }

    setValidatingIFSC(true);
    setIfscValid(null);
    setBankInfo(null);

    try {
      const result: IFSCValidationResponse = await bankDetailsService.validateIFSC(ifsc);
      
      if (result.valid) {
        setIfscValid(true);
        setBankInfo({
          bankName: result.bank_name || "",
          branchName: result.branch_name || "",
          address: result.address || "",
          city: result.city || "",
          state: result.state || "",
        });
        toast.success("IFSC code verified!");
      } else {
        setIfscValid(false);
        toast.error(result.message || "Invalid IFSC code");
      }
    } catch (error: any) {
      setIfscValid(false);
      toast.error("Failed to validate IFSC code");
    } finally {
      setValidatingIFSC(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    // For IFSC, convert to uppercase
    if (field === "ifscCode") {
      value = value.toUpperCase();
      // Reset validation when IFSC changes
      if (ifscValid !== null) {
        setIfscValid(null);
        setBankInfo(null);
      }
    }
    
    // For account number, only allow digits
    if (field === "accountNumber" || field === "confirmAccountNumber") {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit bank details
  const handleSubmit = async () => {
    // Validations
    if (!formData.accountHolderName.trim()) {
      toast.error("Please enter account holder name");
      return;
    }

    if (!formData.accountNumber || formData.accountNumber.length < 9) {
      toast.error("Please enter a valid account number (minimum 9 digits)");
      return;
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return;
    }

    if (!ifscValid || !bankInfo) {
      toast.error("Please validate your IFSC code first");
      return;
    }

    setLoading(true);
    setValidationError(null);

    try {
      const payload: BankDetailsPayload = {
        account_holder_name: formData.accountHolderName.trim(),
        account_number: formData.accountNumber,
        confirm_account_number: formData.confirmAccountNumber,
        ifsc_code: formData.ifscCode.toUpperCase(),
        bank_name: bankInfo.bankName,
        branch_name: bankInfo.branchName,
      };

      await bankDetailsService.submit(payload);
      toast.success("Bank details verified and saved!");
      router.push("/creator/onboarding/verification");
    } catch (error: any) {
      const message = error.response?.data?.detail || "Failed to validate bank details";
      // Check for specific validation errors
      const lowerMessage = message.toLowerCase();
      let displayMessage = message;
      
      if (lowerMessage.includes("invalid") || lowerMessage.includes("validation failed") || lowerMessage.includes("failed")) {
        displayMessage = "Invalid bank account details. Please verify your account number and IFSC code are correct.";
      }
      
      setValidationError(displayMessage);
      toast.error("Bank Account Validation Failed", {
        description: displayMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="animate-spin w-10 h-10" style={{ color: palette.amber }} />
      </div>
    );
  }

  // If already submitted, show summary
  if (alreadySubmitted && existingDetails) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6" style={{ background: palette.bgGradient }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div
              className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-8 border border-white"
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: palette.emerald }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: palette.gray800 }}>
              Bank Details{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Verified
              </span>
            </h1>
            <p className="text-lg" style={{ color: palette.gray600 }}>
              Your bank account is ready to receive payments
            </p>
          </motion.div>

          <Card className="p-8 bg-white/80 backdrop-blur-xl border-white rounded-3xl shadow-xl mb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" style={{ color: palette.emerald }} />
                  <span className="font-semibold text-emerald-700">Verified Account</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                    Account Holder
                  </label>
                  <p className="text-lg font-semibold" style={{ color: palette.gray800 }}>
                    {existingDetails.account_holder_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                    Account Number
                  </label>
                  <p className="text-lg font-semibold font-mono" style={{ color: palette.gray800 }}>
                    {existingDetails.account_number_masked}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                    Bank Name
                  </label>
                  <p className="text-lg font-semibold" style={{ color: palette.gray800 }}>
                    {existingDetails.bank_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                    IFSC Code
                  </label>
                  <p className="text-lg font-semibold font-mono" style={{ color: palette.gray800 }}>
                    {existingDetails.ifsc_code}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/creator/onboarding/verification")}
              className="h-14 px-10 rounded-xl text-white font-bold text-lg"
              style={{ background: palette.brandGradient }}
            >
              Continue to Verification
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6" style={{ background: palette.bgGradient }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Progress */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-4" style={{ color: palette.gray600 }}>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span>Step 4 of 5</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-10">
            <motion.div
              initial={{ width: "60%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: palette.brandGradient }}
            />
          </div>

          {/* Title */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-8 border border-white"
            >
              <Landmark className="w-10 h-10" style={{ color: palette.amber }} />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: palette.gray800 }}>
              Bank{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: palette.brandGradient }}>
                Details
              </span>
            </h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: palette.gray600 }}>
              Add your bank account to receive payments from clients securely via Razorpay
            </p>
          </div>
        </motion.header>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-5 bg-amber-50/80 backdrop-blur border-amber-200 rounded-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" style={{ color: palette.amber }} />
              </div>
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Secure & Verified</h4>
                <p className="text-sm text-amber-700">
                  Your bank details are verified using Razorpay&apos;s secure banking APIs. 
                  We only store masked account information for your security.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Validation Error Banner */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-8"
            >
              <Card className="p-5 bg-red-50/90 backdrop-blur border-red-200 rounded-2xl">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 mb-1">Invalid Bank Account Details</h4>
                    <p className="text-sm text-red-700">{validationError}</p>
                    <p className="text-xs text-red-600 mt-2">
                      Please double-check your account number and IFSC code, then try again.
                    </p>
                  </div>
                  <button 
                    onClick={() => setValidationError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 bg-white/80 backdrop-blur-xl border-white rounded-3xl shadow-xl">
            <div className="space-y-6">
              {/* Account Holder Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-3 block" style={{ color: palette.gray600 }}>
                  Account Holder Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: palette.gray400 }}
                  />
                  <Input
                    className="h-14 pl-12 rounded-xl border-gray-200 bg-white text-lg focus:ring-2 focus:ring-amber-200"
                    placeholder="Name as per bank records"
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: palette.gray400 }}>
                  Enter name exactly as it appears on your bank account
                </p>
              </div>

              {/* IFSC Code */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-3 block" style={{ color: palette.gray600 }}>
                  IFSC Code *
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Building2
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: palette.gray400 }}
                    />
                    <Input
                      className="h-14 pl-12 rounded-xl border-gray-200 bg-white text-lg font-mono uppercase focus:ring-2 focus:ring-amber-200"
                      placeholder="e.g., SBIN0001234"
                      maxLength={11}
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                    />
                    {ifscValid !== null && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {ifscValid ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: palette.emerald }} />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 px-6 rounded-xl border-2 font-bold"
                    style={{ borderColor: palette.amber, color: palette.amber }}
                    onClick={handleIFSCValidation}
                    disabled={validatingIFSC || formData.ifscCode.length !== 11}
                  >
                    {validatingIFSC ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bank Info Display */}
              <AnimatePresence>
                {bankInfo && ifscValid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="p-5 bg-emerald-50/80 border-emerald-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5" style={{ color: palette.emerald }} />
                        <span className="font-bold text-emerald-700">Bank Verified</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-emerald-600 font-medium">Bank:</span>
                          <p className="font-semibold text-emerald-800">{bankInfo.bankName}</p>
                        </div>
                        <div>
                          <span className="text-emerald-600 font-medium">Branch:</span>
                          <p className="font-semibold text-emerald-800">{bankInfo.branchName}</p>
                        </div>
                        {bankInfo.city && (
                          <div className="col-span-2">
                            <span className="text-emerald-600 font-medium">Location:</span>
                            <p className="font-semibold text-emerald-800">
                              {bankInfo.city}, {bankInfo.state}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Account Number */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-3 block" style={{ color: palette.gray600 }}>
                  Account Number *
                </label>
                <div className="relative">
                  <CreditCard
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: palette.gray400 }}
                  />
                  <Input
                    type="password"
                    className="h-14 pl-12 rounded-xl border-gray-200 bg-white text-lg font-mono focus:ring-2 focus:ring-amber-200"
                    placeholder="Enter account number"
                    maxLength={18}
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  />
                </div>
              </div>

              {/* Confirm Account Number */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-3 block" style={{ color: palette.gray600 }}>
                  Confirm Account Number *
                </label>
                <div className="relative">
                  <CreditCard
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: palette.gray400 }}
                  />
                  <Input
                    type="text"
                    className="h-14 pl-12 rounded-xl border-gray-200 bg-white text-lg font-mono focus:ring-2 focus:ring-amber-200"
                    placeholder="Re-enter account number"
                    maxLength={18}
                    value={formData.confirmAccountNumber}
                    onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
                  />
                  {formData.confirmAccountNumber && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {formData.accountNumber === formData.confirmAccountNumber ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: palette.emerald }} />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                  <p className="text-xs text-red-500 mt-2">Account numbers do not match</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading || !ifscValid || !formData.accountNumber || !formData.confirmAccountNumber || !formData.accountHolderName.trim()}
            className="h-14 px-10 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            style={{ background: palette.brandGradient }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Validating Bank Account...
              </>
            ) : (
              <>
                Verify Bank Account & Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-4 text-center"
        >
          <p className="text-xs" style={{ color: palette.gray400 }}>
            Your bank account will be verified using Razorpay before proceeding
          </p>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: palette.gray400 }}>
            <Shield className="w-4 h-4" />
            <span>256-bit SSL encrypted • Razorpay secured</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BankDetailsOnboarding;
