import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ServiceType = "photography" | "videography" | "both" | null;
export type EventCategory =
  | "wedding"
  | "corporate"
  | "portrait"
  | "product"
  | "event"
  | "real-estate"
  | null;
export type BudgetRange = "economy" | "standard" | "premium" | "luxury" | null;

interface ReferenceImage {
  id: string;
  name: string;
  url: string;
  file?: File;
}

interface WizardState {
  currentStep: number;
  serviceType: ServiceType;
  category: EventCategory;
  location: string;

  // 🔥 FIXED
  eventDate: string | null;

  duration: number | null;
  styleNotes: string;
  referenceImages: ReferenceImage[];
  pinterestLink: string;
  budget: BudgetRange;
  selectedStyles: string[];
  timestamp?: number; // Track when data was last updated

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setServiceType: (type: ServiceType) => void;
  setCategory: (category: EventCategory) => void;
  setLocation: (location: string) => void;

  // 🔥 FIXED
  setEventDate: (date: string | null) => void;

  setDuration: (duration: number | null) => void;
  setStyleNotes: (notes: string) => void;
  setReferenceImages: (images: ReferenceImage[]) => void;
  setPinterestLink: (link: string) => void;
  setBudget: (budget: BudgetRange) => void;
  toggleStyle: (styleId: string) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 0,
      serviceType: null,
      category: null,
      location: "",
      eventDate: null,
      duration: null,
      styleNotes: "",
      referenceImages: [],
      pinterestLink: "",
      budget: null,
      selectedStyles: [],
      timestamp: Date.now(),

      setStep: (step) => set({ currentStep: step, timestamp: Date.now() }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1, timestamp: Date.now() })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(0, s.currentStep - 1), timestamp: Date.now() })),

      setServiceType: (serviceType) => set({ serviceType, timestamp: Date.now() }),
      setCategory: (category) => set({ category, timestamp: Date.now() }),
      setLocation: (location) => set({ location, timestamp: Date.now() }),

      // 🔥 FIXED
      setEventDate: (eventDate) => set({ eventDate, timestamp: Date.now() }),

      setDuration: (duration) => set({ duration, timestamp: Date.now() }),
      setStyleNotes: (styleNotes) => set({ styleNotes, timestamp: Date.now() }),
      setReferenceImages: (referenceImages) => set({ referenceImages, timestamp: Date.now() }),
      setPinterestLink: (pinterestLink) => set({ pinterestLink, timestamp: Date.now() }),
      setBudget: (budget) => set({ budget, timestamp: Date.now() }),

      toggleStyle: (styleId) =>
        set((state) => ({
          selectedStyles: state.selectedStyles.includes(styleId)
            ? state.selectedStyles.filter((id) => id !== styleId)
            : [...state.selectedStyles, styleId],
          timestamp: Date.now(),
        })),

      resetWizard: () =>
        set({
          currentStep: 0,
          serviceType: null,
          category: null,
          location: "",
          eventDate: null,
          duration: null,
          styleNotes: "",
          referenceImages: [],
          pinterestLink: "",
          budget: null,
          selectedStyles: [],
          timestamp: Date.now(),
        }),
    }),
    {
      name: "wizard-storage",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Clear expired data on migration
        const now = Date.now();
        const expirationTime = 15 * 60 * 1000; // 15 minutes

        if (persistedState.timestamp && now - persistedState.timestamp > expirationTime) {
          // Data is expired, return initial state
          return {
            currentStep: 0,
            serviceType: null,
            category: null,
            location: "",
            eventDate: null,
            duration: null,
            styleNotes: "",
            referenceImages: [],
            pinterestLink: "",
            budget: null,
            selectedStyles: [],
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Check expiration when store is rehydrated
        if (state) {
          const now = Date.now();
          const expirationTime = 15 * 60 * 1000; // 15 minutes
          const lastSaved = (state as any).timestamp || now;

          if (now - lastSaved > expirationTime) {
            // Data is expired, reset store
            state.currentStep = 0;
            state.serviceType = null;
            state.category = null;
            state.location = "";
            state.eventDate = null;
            state.duration = null;
            state.styleNotes = "";
            state.referenceImages = [];
            state.pinterestLink = "";
            state.budget = null;
            state.selectedStyles = [];
          }
        }
      },
    }
  )
);
