// ============== VISIONMATCH THEME ==============
// Shared palette matching the landing page

export const palette = {
  // Primary Colors
  pink: "#ec4899",
  pink600: "#db2777",
  pink400: "#f472b6",
  rose: "#f43f5e",
  purple: "#a855f7",
  purple600: "#9333ea",
  blue: "#3b82f6",
  blue600: "#2563eb",
  cyan: "#22d3ee",
  indigo: "#6366f1",
  
  // Neutral Colors
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray800: "#1f2937",
  gray900: "#111827",
  
  // Accent Colors
  emerald: "#059669",
  yellow: "#eab308",
  amber: "#f59e0b",
  red: "#ef4444",
  
  // Gradients
  bgGradient: "linear-gradient(to bottom right, #f9fafb, #fdf2f8, #eff6ff)",
  brandGradient: "linear-gradient(to right, #ec4899, #a855f7, #3b82f6)",
  ctaGradient: "linear-gradient(to right, #ec4899, #3b82f6)",
  pinkGradient: "linear-gradient(to right, #ec4899, #db2777)",
  blueGradient: "linear-gradient(to right, #3b82f6, #2563eb)",
  purpleGradient: "linear-gradient(to right, #a855f7, #9333ea)",
  
  // Card Gradients
  cardGradient1: "linear-gradient(to bottom right, #f472b6, #f43f5e)",
  cardGradient2: "linear-gradient(to bottom right, #60a5fa, #6366f1)",
  cardGradient3: "linear-gradient(to bottom right, #c084fc, #f472b6)",
  cardGradient4: "linear-gradient(to bottom right, #22d3ee, #3b82f6)",
};

// CSS Variables for global use
export const cssVariables = `
  :root {
    --pink: ${palette.pink};
    --pink-600: ${palette.pink600};
    --pink-400: ${palette.pink400};
    --purple: ${palette.purple};
    --purple-600: ${palette.purple600};
    --blue: ${palette.blue};
    --blue-600: ${palette.blue600};
    --brand-gradient: ${palette.brandGradient};
    --cta-gradient: ${palette.ctaGradient};
    --bg-gradient: ${palette.bgGradient};
  }
`;

// Tailwind-style class mappings
export const themeClasses = {
  // Backgrounds
  bgPage: "bg-gradient-to-br from-gray-50 via-pink-50/30 to-blue-50/30",
  bgCard: "bg-white/80 backdrop-blur-sm",
  bgCardHover: "hover:bg-white hover:shadow-xl hover:shadow-pink-100/50",
  
  // Buttons
  btnPrimary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/30",
  btnSecondary: "bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50",
  btnGhost: "text-gray-600 hover:text-pink-500 hover:bg-pink-50",
  
  // Text
  textGradient: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent",
  
  // Borders
  borderDefault: "border-gray-200",
  borderHover: "hover:border-pink-300",
  borderActive: "border-pink-500",
  
  // Shadows
  shadowCard: "shadow-lg shadow-gray-100/50",
  shadowCardHover: "hover:shadow-xl hover:shadow-pink-100/50",
  shadowPink: "shadow-pink-500/30",
};
