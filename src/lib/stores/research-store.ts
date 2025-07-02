import { create } from 'zustand';
import { ResearchState, ResearchResult, ResearchRequest } from '@/types/research';

interface ResearchStore extends ResearchState {
  // Actions
  startResearch: (request: ResearchRequest) => Promise<void>;
  setCurrentResearch: (research: ResearchResult | undefined) => void;
  addToHistory: (research: ResearchResult) => void;
  setIsResearching: (isResearching: boolean) => void;
  updateResearchProgress: (researchId: string, updates: Partial<ResearchResult>) => void;
}

export const useResearchStore = create<ResearchStore>((set, get) => ({
  // State
  currentResearch: undefined,
  researchHistory: [],
  isResearching: false,
  currentStep: undefined,

  // Actions
  startResearch: async (request: ResearchRequest) => {
    set({ isResearching: true });
    
    try {
      const response = await fetch('/api/research/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to start research');
      }

      const researchResult: ResearchResult = await response.json();
      
      set({ 
        currentResearch: researchResult,
        isResearching: researchResult.status === 'researching' || researchResult.status === 'analyzing',
      });

      // If research is complete, add to history
      if (researchResult.status === 'completed') {
        get().addToHistory(researchResult);
      }
    } catch (error) {
      console.error('Failed to start research:', error);
      set({ isResearching: false });
      throw error;
    }
  },

  setCurrentResearch: (research: ResearchResult | undefined) => {
    set({ currentResearch: research });
  },

  addToHistory: (research: ResearchResult) => {
    set(state => ({
      researchHistory: [research, ...state.researchHistory.slice(0, 9)] // Keep last 10
    }));
  },

  setIsResearching: (isResearching: boolean) => {
    set({ isResearching });
  },

  updateResearchProgress: (researchId: string, updates: Partial<ResearchResult>) => {
    set(state => {
      if (state.currentResearch?.id === researchId) {
        return {
          currentResearch: { ...state.currentResearch, ...updates }
        };
      }
      return state;
    });
  },
}));
