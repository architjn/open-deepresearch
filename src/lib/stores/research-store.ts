import { create } from 'zustand';
import { ResearchResult, ResearchStepUpdate } from '@/types/research';

interface ResearchState {
  currentResearch?: ResearchResult;
  researchHistory: ResearchResult[];
  isResearching: boolean;
}

interface ResearchStore extends ResearchState {
  updateResearchProgress: (update: ResearchStepUpdate) => void;
  startNewResearch: (initialResearch: ResearchResult) => void;
  addToHistory: (research: ResearchResult) => void;
}

export const useResearchStore = create<ResearchStore>((set) => ({
  currentResearch: undefined,
  researchHistory: [],
  isResearching: false,

  startNewResearch: (initialResearch: ResearchResult) => {
    set({
      currentResearch: initialResearch,
      isResearching: true,
    });
  },

  updateResearchProgress: (update) => {
    set((state) => {
      if (!state.currentResearch) return state;

      const updatedSteps = [...state.currentResearch.steps];
      let targetStep = updatedSteps.find(s => s.id === update.stepId);

      if (!targetStep) {
        // Create new step if it doesn't exist (e.g., initial "Thinking" step)
        targetStep = {
          id: update.stepId,
          description: update.phase || 'Unknown Step', // Use phase as description initially
          type: 'planning', // Default type, can be refined by AI
          status: 'pending',
          progress: 0,
          startTime: new Date(),
          logs: [],
          phase: update.phase,
        };
        updatedSteps.push(targetStep);
      }

      // Update step properties
      if (update.phase) targetStep.phase = update.phase;
      if (update.status) targetStep.status = update.status;
      if (update.progress !== undefined) targetStep.progress = update.progress;
      if (update.logEntry) targetStep.logs?.push(update.logEntry);
      if (update.status === 'completed' || update.status === 'failed') targetStep.endTime = new Date();

      return {
        currentResearch: {
          ...state.currentResearch,
          steps: updatedSteps,
          currentPhase: update.phase || state.currentResearch.currentPhase, // Update overall phase
        },
        isResearching: update.status !== 'completed' && update.status !== 'failed',
      };
    });
  },

  addToHistory: (research: ResearchResult) => {
    set(state => ({
      researchHistory: [research, ...state.researchHistory.slice(0, 9)] // Keep last 10
    }));
  },
}));
