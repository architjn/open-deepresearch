export interface ResearchRequest {
  query: string;
  depth: 'surface' | 'medium' | 'deep';
  domains?: string[];
  timeframe?: string;
  sources?: SourceType[];
  maxSources?: number;
}

export interface ResearchPlan {
  subQueries: string[];
  searchStrategies: SearchStrategy[];
  analysisFrameworks: AnalysisType[];
  estimatedSteps: number;
  estimatedTimeMinutes: number;
}

export interface SearchStrategy {
  type: 'web' | 'academic' | 'news' | 'social' | 'expert';
  keywords: string[];
  priority: number;
  maxResults: number;
}

export interface AnalysisType {
  type: 'factCheck' | 'biasDetection' | 'credibilityAssessment' | 'multiPerspective' | 'timeline' | 'stakeholder';
  priority: number;
}

export interface SourceType {
  type: 'web' | 'academic' | 'news' | 'social' | 'expert' | 'government' | 'statistics';
  weight: number;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  content: string;
  summary: string;
  type: SourceType['type'];
  credibilityScore: number;
  biasScore: number;
  publishedDate?: Date;
  author?: string;
  extractedAt: Date;
}

export interface ResearchStep {
  id: string;
  type: 'search' | 'analysis' | 'synthesis' | 'verification';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  sources?: Source[];
  findings?: string[];
}

export interface ResearchAnalysis {
  perspectives: Perspective[];
  timeline?: TimelineEvent[];
  stakeholders?: Stakeholder[];
  prosAndCons?: ProsCons;
  factChecks?: FactCheck[];
  confidenceLevel: number;
  gaps: string[];
}

export interface Perspective {
  name: string;
  description: string;
  keyPoints: string[];
  supportingSources: string[];
  confidence: number;
}

export interface TimelineEvent {
  date: Date;
  event: string;
  significance: number;
  sources: string[];
}

export interface Stakeholder {
  name: string;
  type: 'individual' | 'organization' | 'government' | 'community';
  interests: string[];
  impact: 'positive' | 'negative' | 'neutral';
  influence: number;
}

export interface ProsCons {
  pros: {
    point: string;
    strength: number;
    sources: string[];
  }[];
  cons: {
    point: string;
    strength: number;
    sources: string[];
  }[];
}

export interface FactCheck {
  claim: string;
  verification: 'verified' | 'disputed' | 'false' | 'unverifiable';
  confidence: number;
  sources: string[];
  explanation: string;
}

export interface ResearchResult {
  id: string;
  request: ResearchRequest;
  plan: ResearchPlan;
  steps: ResearchStep[];
  sources: Source[];
  analysis: ResearchAnalysis;
  executiveSummary: string;
  detailedFindings: string;
  recommendations: string[];
  followUpQuestions: string[];
  status: 'planning' | 'researching' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  totalSources: number;
  credibilityScore: number;
}

export interface ResearchState {
  currentResearch?: ResearchResult;
  researchHistory: ResearchResult[];
  isResearching: boolean;
  currentStep?: ResearchStep;
}
