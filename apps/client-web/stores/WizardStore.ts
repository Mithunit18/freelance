import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReferenceImage {
  id: string;
  name: string;
  url: string;
}

interface WizardState {
  // Service Details
  serviceType: string;
  category: string;
  
  // Event Details
  location: string;
  eventDate: string | Date | null;
  duration: string;
  
  // Style Preferences
  styleNotes: string;
  selectedStyles: string[];
  referenceImages: ReferenceImage[];
  pinterestLink: string;
  
  // Budget
  budget: string;
  
  // Actions
  setServiceType: (type: string) => void;
  setCategory: (category: string) => void;
  setLocation: (location: string) => void;
  setEventDate: (date: string | Date | null) => void;
  setDuration: (duration: string) => void;
  setStyleNotes: (notes: string) => void;
  setSelectedStyles: (styles: string[]) => void;
  addReferenceImage: (image: ReferenceImage) => void;
  removeReferenceImage: (id: string) => void;
  setPinterestLink: (link: string) => void;
  setBudget: (budget: string) => void;
  resetWizard: () => void;
}

const initialState = {
  serviceType: '',
  category: '',
  location: '',
  eventDate: null,
  duration: '',
  styleNotes: '',
  selectedStyles: [],
  referenceImages: [],
  pinterestLink: '',
  budget: '',
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setServiceType: (type) => set({ serviceType: type }),
      setCategory: (category) => set({ category }),
      setLocation: (location) => set({ location }),
      setEventDate: (date) => set({ eventDate: date }),
      setDuration: (duration) => set({ duration }),
      setStyleNotes: (notes) => set({ styleNotes: notes }),
      setSelectedStyles: (styles) => set({ selectedStyles: styles }),
      addReferenceImage: (image) => 
        set((state) => ({ 
          referenceImages: [...state.referenceImages, image] 
        })),
      removeReferenceImage: (id) => 
        set((state) => ({ 
          referenceImages: state.referenceImages.filter((img) => img.id !== id) 
        })),
      setPinterestLink: (link) => set({ pinterestLink: link }),
      setBudget: (budget) => set({ budget }),
      resetWizard: () => set(initialState),
    }),
    {
      name: 'wizard-storage',
    }
  )
);
