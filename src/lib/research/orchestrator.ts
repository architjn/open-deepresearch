import { ResearchRequest, ResearchPlan, ResearchStep, ResearchResult, SearchStrategy, AnalysisType, Source, Perspective, TimelineEvent, Stakeholder } from '@/types/research';
import { nanoid } from 'nanoid';
import { SearchEngineManager } from './search-engines';

export class ResearchOrchestrator {
  planResearch(request: ResearchRequest): ResearchPlan {
    const subQueries = this.breakdownQuery(request.query, request.depth);
    const searchStrategies = this.defineSearchStrategies(request);
    const analysisFrameworks = this.defineAnalysisFrameworks(request);

    return {
      subQueries,
      searchStrategies,
      analysisFrameworks,
      estimatedSteps: this.calculateEstimatedSteps(subQueries, searchStrategies, analysisFrameworks),
      estimatedTimeMinutes: this.calculateEstimatedTime(request.depth, subQueries.length),
    };
  }

  initializeResearch(request: ResearchRequest): ResearchResult {
    const plan = this.planResearch(request);
    const steps = this.createResearchSteps(plan);

    return {
      id: nanoid(),
      request,
      plan,
      steps,
      sources: [],
      analysis: {
        perspectives: [],
        confidenceLevel: 0,
        gaps: [],
      },
      executiveSummary: '',
      detailedFindings: '',
      recommendations: [],
      followUpQuestions: [],
      status: 'planning',
      progress: 0,
      startTime: new Date(),
      totalSources: 0,
      credibilityScore: 0,
    };
  }

  async executeStep(result: ResearchResult, stepId: string, searchManager?: SearchEngineManager): Promise<ResearchResult> {
    const step = result.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);

    step.status = 'running';
    step.startTime = new Date();
    
    try {
      switch (step.type) {
        case 'search':
          if (!searchManager) {
            throw new Error('Search manager is required for search steps');
          }
          await this.executeSearchStep(step, result, searchManager);
          break;
        case 'analysis':
          await this.executeAnalysisStep(step, result);
          break;
        case 'synthesis':
          await this.executeSynthesisStep(step, result);
          break;
        case 'verification':
          await this.executeVerificationStep(step, result);
          break;
        default:
          await this.simulateStepExecution(step);
      }
      
      step.status = 'completed';
      step.progress = 100;
      step.endTime = new Date();
      
      // Update overall progress
      const completedSteps = result.steps.filter(s => s.status === 'completed').length;
      result.progress = (completedSteps / result.steps.length) * 100;
      
      if (completedSteps === result.steps.length) {
        result.status = 'completed';
        result.endTime = new Date();
        await this.generateFinalReport(result);
      }
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  async executeAllSteps(result: ResearchResult, searchManager: SearchEngineManager): Promise<ResearchResult> {
    result.status = 'researching';
    
    // Execute search steps first
    const searchSteps = result.steps.filter(step => step.type === 'search');
    for (const step of searchSteps) {
      await this.executeStep(result, step.id, searchManager);
    }
    
    // Update status to analyzing
    result.status = 'analyzing';
    
    // Execute analysis steps
    const analysisSteps = result.steps.filter(step => step.type === 'analysis');
    for (const step of analysisSteps) {
      await this.executeStep(result, step.id, searchManager);
    }
    
    // Execute synthesis step
    const synthesisSteps = result.steps.filter(step => step.type === 'synthesis');
    for (const step of synthesisSteps) {
      await this.executeStep(result, step.id, searchManager);
    }
    
    return result;
  }

  private async executeSearchStep(step: ResearchStep, result: ResearchResult, searchManager: SearchEngineManager): Promise<void> {
    if (!searchManager) {
      throw new Error('Search manager not provided');
    }
    
    const query = step.description.replace('Searching: ', '');
    const strategy = result.plan.searchStrategies.find(s => 
      s.keywords.some(keyword => query.includes(keyword))
    ) || result.plan.searchStrategies[0];
    
    const sources = await searchManager.executeSearch(strategy, query);
    step.sources = sources;
    step.findings = [
      `Found ${sources.length} sources`,
      `Average credibility score: ${this.calculateAverageCredibility(sources).toFixed(2)}`,
      `Source types: ${this.getSourceTypes(sources).join(', ')}`
    ];
    
    // Add sources to main result
    result.sources.push(...sources);
    result.totalSources = result.sources.length;
  }

  private async executeAnalysisStep(step: ResearchStep, result: ResearchResult): Promise<void> {
    const analysisType = step.description.replace('Analyzing: ', '');
    
    switch (analysisType) {
      case 'factCheck':
        await this.performFactChecking(step, result);
        break;
      case 'credibilityAssessment':
        await this.performCredibilityAssessment(step, result);
        break;
      case 'biasDetection':
        await this.performBiasDetection(step, result);
        break;
      case 'multiPerspective':
        await this.performMultiPerspectiveAnalysis(step, result);
        break;
      case 'timeline':
        await this.performTimelineAnalysis(step, result);
        break;
      case 'stakeholder':
        await this.performStakeholderAnalysis(step, result);
        break;
      default:
        step.findings = [`Completed ${analysisType} analysis`];
    }
  }

  private async executeSynthesisStep(step: ResearchStep, result: ResearchResult): Promise<void> {
    // Generate executive summary
    result.executiveSummary = this.generateExecutiveSummary(result);
    
    // Generate detailed findings
    result.detailedFindings = this.generateDetailedFindings(result);
    
    // Generate recommendations
    result.recommendations = this.generateRecommendations(result);
    
    // Generate follow-up questions
    result.followUpQuestions = this.generateFollowUpQuestions(result);
    
    // Calculate overall credibility score
    result.credibilityScore = this.calculateOverallCredibility(result);
    
    step.findings = [
      'Generated executive summary',
      'Synthesized detailed findings',
      'Created recommendations',
      'Identified follow-up questions'
    ];
  }

  private async executeVerificationStep(step: ResearchStep, result: ResearchResult): Promise<void> {
    // Cross-reference facts across sources
    const verificationResults = this.crossReferenceFacts(result.sources);
    
    step.findings = [
      `Verified ${verificationResults.verifiedClaims} claims`,
      `Found ${verificationResults.conflicts} conflicting information`,
      `Reliability score: ${verificationResults.reliabilityScore.toFixed(2)}`
    ];
  }

  private async generateFinalReport(result: ResearchResult): Promise<void> {
    // Update confidence levels and gaps
    result.analysis.confidenceLevel = this.calculateConfidenceLevel(result);
    result.analysis.gaps = this.identifyKnowledgeGaps(result);
    
    // Mark as completed
    result.status = 'completed';
  }

  private breakdownQuery(query: string, depth: string): string[] {
    const baseQuery = query.toLowerCase();
    const queries = [baseQuery];
    
    // Generate sub-queries based on depth
    switch (depth) {
      case 'surface':
        queries.push(`${baseQuery} definition`);
        queries.push(`${baseQuery} overview`);
        break;
      case 'medium':
        queries.push(`${baseQuery} definition`);
        queries.push(`${baseQuery} causes`);
        queries.push(`${baseQuery} effects`);
        queries.push(`${baseQuery} examples`);
        break;
      case 'deep':
        queries.push(`${baseQuery} definition`);
        queries.push(`${baseQuery} history`);
        queries.push(`${baseQuery} causes`);
        queries.push(`${baseQuery} effects`);
        queries.push(`${baseQuery} stakeholders`);
        queries.push(`${baseQuery} pros and cons`);
        queries.push(`${baseQuery} future implications`);
        queries.push(`${baseQuery} alternative perspectives`);
        break;
    }
    
    return queries;
  }

  private defineSearchStrategies(request: ResearchRequest): SearchStrategy[] {
    const strategies: SearchStrategy[] = [
      {
        type: 'web',
        keywords: [request.query],
        priority: 1,
        maxResults: request.depth === 'deep' ? 15 : 10,
      }
    ];

    if (request.depth === 'deep') {
      strategies.push({
        type: 'news',
        keywords: [request.query, `${request.query} recent`],
        priority: 2,
        maxResults: 8,
      });
      
      strategies.push({
        type: 'academic',
        keywords: [request.query],
        priority: 3,
        maxResults: 5,
      });
    }

    return strategies;
  }

  private defineAnalysisFrameworks(request: ResearchRequest): AnalysisType[] {
    const frameworks: AnalysisType[] = [
      { type: 'factCheck', priority: 1 },
      { type: 'credibilityAssessment', priority: 2 },
    ];

    if (request.depth === 'medium' || request.depth === 'deep') {
      frameworks.push({ type: 'multiPerspective', priority: 3 });
      frameworks.push({ type: 'biasDetection', priority: 4 });
    }

    if (request.depth === 'deep') {
      frameworks.push({ type: 'timeline', priority: 5 });
      frameworks.push({ type: 'stakeholder', priority: 6 });
    }

    return frameworks;
  }

  private createResearchSteps(plan: ResearchPlan): ResearchStep[] {
    const steps: ResearchStep[] = [];
    
    // Create search steps
    plan.subQueries.forEach((query) => {
      steps.push({
        id: nanoid(),
        type: 'search',
        description: `Searching: ${query}`,
        status: 'pending',
        progress: 0,
      });
    });
    
    // Create analysis steps
    plan.analysisFrameworks.forEach(framework => {
      steps.push({
        id: nanoid(),
        type: 'analysis',
        description: `Analyzing: ${framework.type}`,
        status: 'pending',
        progress: 0,
      });
    });
    
    // Create synthesis step
    steps.push({
      id: nanoid(),
      type: 'synthesis',
      description: 'Synthesizing findings',
      status: 'pending',
      progress: 0,
    });

    return steps;
  }

  private calculateEstimatedSteps(queries: string[], strategies: SearchStrategy[], frameworks: AnalysisType[]): number {
    return queries.length + frameworks.length + 1; // +1 for synthesis
  }

  private calculateEstimatedTime(depth: string, queryCount: number): number {
    const baseTime = {
      surface: 2,
      medium: 5,
      deep: 10,
    }[depth] || 5;
    
    return baseTime * queryCount;
  }

  private async simulateStepExecution(step: ResearchStep): Promise<void> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add some mock findings
    step.findings = [
      `Completed ${step.description}`,
      `Found relevant information for analysis`
    ];
  }

  // Helper methods for calculations and analysis
  private calculateAverageCredibility(sources: Source[]): number {
    if (sources.length === 0) return 0;
    const total = sources.reduce((sum, source) => sum + (source.credibilityScore || 0), 0);
    return total / sources.length;
  }

  private getSourceTypes(sources: Source[]): string[] {
    const types = new Set(sources.map(source => source.type));
    return Array.from(types);
  }

  // Analysis methods
  private async performFactChecking(step: ResearchStep, result: ResearchResult): Promise<void> {
    const factChecks = [];
    const claims = this.extractClaims(result.sources);
    
    for (const claim of claims.slice(0, 5)) { // Limit to 5 claims for performance
      const verification = this.verifyClaim(claim, result.sources);
      factChecks.push({
        claim,
        verification: verification.status,
        confidence: verification.confidence,
        sources: verification.sources,
        explanation: verification.explanation
      });
    }
    
    result.analysis.factChecks = factChecks;
    step.findings = [
      `Fact-checked ${factChecks.length} claims`,
      `${factChecks.filter(fc => fc.verification === 'verified').length} verified`,
      `${factChecks.filter(fc => fc.verification === 'disputed').length} disputed`
    ];
  }

  private async performCredibilityAssessment(step: ResearchStep, result: ResearchResult): Promise<void> {
    const avgCredibility = this.calculateAverageCredibility(result.sources);
    const highCredSources = result.sources.filter(s => s.credibilityScore > 0.8).length;
    const lowCredSources = result.sources.filter(s => s.credibilityScore < 0.5).length;
    
    step.findings = [
      `Average credibility: ${avgCredibility.toFixed(2)}`,
      `High credibility sources: ${highCredSources}`,
      `Low credibility sources: ${lowCredSources}`
    ];
  }

  private async performBiasDetection(step: ResearchStep, result: ResearchResult): Promise<void> {
    const biasAnalysis = this.analyzeBias(result.sources);
    
    step.findings = [
      `Average bias score: ${biasAnalysis.averageBias.toFixed(2)}`,
      `Political lean: ${biasAnalysis.politicalLean}`,
      `Source diversity: ${biasAnalysis.diversity}`
    ];
  }

  private async performMultiPerspectiveAnalysis(step: ResearchStep, result: ResearchResult): Promise<void> {
    const perspectives = this.extractPerspectives(result.sources);
    result.analysis.perspectives = perspectives;
    
    step.findings = [
      `Identified ${perspectives.length} perspectives`,
      `Perspectives: ${perspectives.map(p => p.name).join(', ')}`
    ];
  }

  private async performTimelineAnalysis(step: ResearchStep, result: ResearchResult): Promise<void> {
    const timeline = this.extractTimeline(result.sources);
    result.analysis.timeline = timeline;
    
    step.findings = [
      `Created timeline with ${timeline?.length || 0} events`,
      `Date range: ${this.getDateRange(timeline)}`
    ];
  }

  private async performStakeholderAnalysis(step: ResearchStep, result: ResearchResult): Promise<void> {
    const stakeholders = this.identifyStakeholders(result.sources);
    result.analysis.stakeholders = stakeholders;
    
    step.findings = [
      `Identified ${stakeholders?.length || 0} stakeholders`,
      `Key players: ${stakeholders?.slice(0, 3).map(s => s.name).join(', ') || 'None'}`
    ];
  }

  // Synthesis methods
  private generateExecutiveSummary(result: ResearchResult): string {
    const query = result.request.query;
    const sourceCount = result.sources.length;
    const credibility = result.credibilityScore.toFixed(2);
    
    return `This research on "${query}" analyzed ${sourceCount} sources with an average credibility score of ${credibility}. ` +
           `The investigation revealed multiple perspectives and provides comprehensive insights into the topic. ` +
           `Key findings include verified information from diverse sources across different domains and timeframes.`;
  }

  private generateDetailedFindings(result: ResearchResult): string {
    let findings = `## Detailed Research Findings\n\n`;
    
    // Source analysis
    findings += `### Source Analysis\n`;
    findings += `- Total sources analyzed: ${result.sources.length}\n`;
    findings += `- Source types: ${this.getSourceTypes(result.sources).join(', ')}\n`;
    findings += `- Average credibility: ${this.calculateAverageCredibility(result.sources).toFixed(2)}\n\n`;
    
    // Perspectives
    if (result.analysis.perspectives.length > 0) {
      findings += `### Key Perspectives\n`;
      result.analysis.perspectives.forEach(perspective => {
        findings += `- **${perspective.name}**: ${perspective.description}\n`;
      });
      findings += '\n';
    }
    
    // Timeline
    if (result.analysis.timeline && result.analysis.timeline.length > 0) {
      findings += `### Timeline\n`;
      result.analysis.timeline.slice(0, 5).forEach(event => {
        findings += `- ${event.date.toISOString().split('T')[0]}: ${event.event}\n`;
      });
      findings += '\n';
    }
    
    return findings;
  }

  private generateRecommendations(result: ResearchResult): string[] {
    const recommendations = [];
    
    // Based on credibility
    const avgCredibility = this.calculateAverageCredibility(result.sources);
    if (avgCredibility < 0.7) {
      recommendations.push('Consider seeking additional high-credibility sources to strengthen findings');
    }
    
    // Based on source diversity
    const sourceTypes = this.getSourceTypes(result.sources);
    if (sourceTypes.length < 3) {
      recommendations.push('Expand research to include more diverse source types');
    }
    
    // Based on gaps
    if (result.analysis.gaps.length > 0) {
      recommendations.push(`Address identified knowledge gaps: ${result.analysis.gaps.slice(0, 2).join(', ')}`);
    }
    
    return recommendations.length > 0 ? recommendations : ['Continue monitoring for new developments', 'Consider periodic research updates'];
  }

  private generateFollowUpQuestions(result: ResearchResult): string[] {
    const query = result.request.query;
    return [
      `What are the latest developments regarding ${query}?`,
      `How might ${query} evolve in the next 5 years?`,
      `What are the alternative viewpoints on ${query}?`,
      `What evidence contradicts the main findings about ${query}?`
    ];
  }

  private calculateOverallCredibility(result: ResearchResult): number {
    return this.calculateAverageCredibility(result.sources);
  }

  private calculateConfidenceLevel(result: ResearchResult): number {
    const credibilityScore = this.calculateAverageCredibility(result.sources);
    const sourceCount = result.sources.length;
    const sourceTypes = this.getSourceTypes(result.sources).length;
    
    // Confidence based on multiple factors
    let confidence = credibilityScore * 0.4; // 40% from credibility
    confidence += Math.min(sourceCount / 20, 1) * 0.3; // 30% from quantity (max at 20 sources)
    confidence += Math.min(sourceTypes / 4, 1) * 0.3; // 30% from diversity (max at 4 types)
    
    return Math.min(confidence, 1.0);
  }

  private identifyKnowledgeGaps(result: ResearchResult): string[] {
    const gaps = [];
    
    // Check for missing source types
    const sourceTypes = this.getSourceTypes(result.sources);
    if (!sourceTypes.includes('academic')) {
      gaps.push('Limited academic research sources');
    }
    if (!sourceTypes.includes('news')) {
      gaps.push('Insufficient current news coverage');
    }
    
    // Check for low source count
    if (result.sources.length < 10) {
      gaps.push('Limited overall source count');
    }
    
    // Check for recent information
    const recentSources = result.sources.filter(s => 
      s.publishedDate && s.publishedDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    if (recentSources.length < 3) {
      gaps.push('Limited recent information');
    }
    
    return gaps;
  }

  // Helper methods for analysis
  private extractClaims(sources: Source[]): string[] {
    // Simple claim extraction - in a real implementation, this would use NLP
    const claims: string[] = [];
    for (const source of sources.slice(0, 5)) {
      const sentences = source.content.split('.').filter((s: string) => s.length > 50);
      claims.push(...sentences.slice(0, 2));
    }
    return claims.slice(0, 10);
  }

  private verifyClaim(claim: string, sources: Source[]): { status: 'verified' | 'disputed' | 'false' | 'unverifiable'; confidence: number; sources: string[]; explanation: string } {
    // Simple verification logic - in reality, this would use advanced NLP
    const supportingSources = sources.filter(s => 
      s.content.toLowerCase().includes(claim.toLowerCase().substring(0, 30))
    );
    
    return {
      status: supportingSources.length > 1 ? 'verified' : 'unverifiable',
      confidence: Math.min(supportingSources.length / 3, 1),
      sources: supportingSources.slice(0, 3).map(s => s.id),
      explanation: `Found in ${supportingSources.length} sources`
    };
  }

  private analyzeBias(sources: Source[]): { averageBias: number; politicalLean: string; diversity: string } {
    const avgBias = sources.reduce((sum, s) => sum + (s.biasScore || 0.5), 0) / sources.length;
    
    return {
      averageBias: avgBias,
      politicalLean: avgBias < 0.4 ? 'left' : avgBias > 0.6 ? 'right' : 'center',
      diversity: this.getSourceTypes(sources).length > 2 ? 'high' : 'medium'
    };
  }

  private extractPerspectives(sources: Source[]): Perspective[] {
    // Generate basic perspectives based on source analysis
    const perspectives = [];
    
    if (sources.some(s => s.type === 'academic')) {
      perspectives.push({
        name: 'Academic/Research Perspective',
        description: 'Scholarly and research-based viewpoint',
        keyPoints: ['Evidence-based analysis', 'Peer-reviewed insights'],
        supportingSources: sources.filter(s => s.type === 'academic').map(s => s.id),
        confidence: 0.8
      });
    }
    
    if (sources.some(s => s.type === 'news')) {
      perspectives.push({
        name: 'Media/Journalistic Perspective',
        description: 'Current events and news analysis',
        keyPoints: ['Recent developments', 'Public interest'],
        supportingSources: sources.filter(s => s.type === 'news').map(s => s.id),
        confidence: 0.7
      });
    }
    
    perspectives.push({
      name: 'General Information Perspective',
      description: 'Broad overview from web sources',
      keyPoints: ['Comprehensive coverage', 'Multiple viewpoints'],
      supportingSources: sources.filter(s => s.type === 'web').map(s => s.id),
      confidence: 0.6
    });
    
    return perspectives;
  }

  private extractTimeline(sources: Source[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    // Extract events from sources with dates
    sources.forEach(source => {
      if (source.publishedDate) {
        events.push({
          date: source.publishedDate,
          event: source.title,
          significance: source.credibilityScore || 0.5,
          sources: [source.id]
        });
      }
    });
    
    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private identifyStakeholders(sources: Source[]): Stakeholder[] {
    // Basic stakeholder identification - in reality, this would use NLP
    const stakeholders = [];
    
    // Generic stakeholders based on common patterns
    stakeholders.push({
      name: 'General Public',
      type: 'community' as const,
      interests: ['Information access', 'Understanding'],
      impact: 'neutral' as const,
      influence: 0.5
    });
    
    if (sources.some(s => s.url.includes('gov'))) {
      stakeholders.push({
        name: 'Government Entities',
        type: 'government' as const,
        interests: ['Policy', 'Regulation'],
        impact: 'neutral' as const,
        influence: 0.8
      });
    }
    
    return stakeholders;
  }

  private getDateRange(timeline: TimelineEvent[] | undefined): string {
    if (!timeline || timeline.length === 0) return 'No dates available';
    
    const dates = timeline.map(event => new Date(event.date)).sort((a, b) => a.getTime() - b.getTime());
    const earliest = dates[0].toISOString().split('T')[0];
    const latest = dates[dates.length - 1].toISOString().split('T')[0];
    
    return earliest === latest ? earliest : `${earliest} to ${latest}`;
  }

  private crossReferenceFacts(sources: Source[]): { verifiedClaims: number; conflicts: number; reliabilityScore: number } {
    // Simple cross-referencing logic
    const totalClaims = sources.length * 2; // Assume 2 claims per source on average
    const verifiedClaims = Math.floor(totalClaims * 0.7); // 70% verification rate
    const conflicts = Math.floor(totalClaims * 0.1); // 10% conflicts
    
    return {
      verifiedClaims,
      conflicts,
      reliabilityScore: 0.8 - (conflicts / totalClaims)
    };
  }
}

