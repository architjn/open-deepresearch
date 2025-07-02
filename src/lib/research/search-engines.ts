import { Source, SearchStrategy } from '@/types/research';
import { nanoid } from 'nanoid';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  query: string;
  response_time: number;
}

export class SearchEngineManager {
  private tavilyApiKey: string | undefined;

  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
  }

  async executeSearch(strategy: SearchStrategy, query: string): Promise<Source[]> {
    switch (strategy.type) {
      case 'web':
        return this.searchWeb(query, strategy.maxResults);
      case 'news':
        return this.searchNews(query, strategy.maxResults);
      case 'academic':
        return this.searchAcademic(query, strategy.maxResults);
      default:
        throw new Error(`Search type ${strategy.type} not implemented`);
    }
  }

  private async searchWeb(query: string, maxResults: number): Promise<Source[]> {
    if (!this.tavilyApiKey) {
      console.warn('Tavily API key not found, using mock data');
      return this.generateMockSources(query, maxResults, 'web');
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tavilyApiKey}`,
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
          search_depth: 'advanced',
          include_answer: true,
          include_domains: [],
          exclude_domains: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data: TavilyResponse = await response.json();
      return this.transformTavilyResults(data.results, 'web');
    } catch (error) {
      console.error('Web search failed:', error);
      return this.generateMockSources(query, maxResults, 'web');
    }
  }

  private async searchNews(query: string, maxResults: number): Promise<Source[]> {
    if (!this.tavilyApiKey) {
      return this.generateMockSources(query, maxResults, 'news');
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tavilyApiKey}`,
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
          search_depth: 'advanced',
          include_answer: true,
          include_domains: ['reuters.com', 'bbc.com', 'cnn.com', 'apnews.com'],
          days: 30, // Recent news from last 30 days
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data: TavilyResponse = await response.json();
      return this.transformTavilyResults(data.results, 'news');
    } catch (error) {
      console.error('News search failed:', error);
      return this.generateMockSources(query, maxResults, 'news');
    }
  }

  private async searchAcademic(query: string, maxResults: number): Promise<Source[]> {
    // For now, use web search with academic domains
    // In future, integrate with arXiv, PubMed, etc.
    if (!this.tavilyApiKey) {
      return this.generateMockSources(query, maxResults, 'academic');
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tavilyApiKey}`,
        },
        body: JSON.stringify({
          query: `${query} academic research paper`,
          max_results: maxResults,
          search_depth: 'advanced',
          include_answer: true,
          include_domains: ['arxiv.org', 'scholar.google.com', 'pubmed.ncbi.nlm.nih.gov', 'jstor.org'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data: TavilyResponse = await response.json();
      return this.transformTavilyResults(data.results, 'academic');
    } catch (error) {
      console.error('Academic search failed:', error);
      return this.generateMockSources(query, maxResults, 'academic');
    }
  }

  private transformTavilyResults(results: TavilySearchResult[], type: Source['type']): Source[] {
    return results.map(result => ({
      id: nanoid(),
      url: result.url,
      title: result.title,
      content: result.content,
      summary: this.generateSummary(result.content),
      type,
      credibilityScore: this.calculateCredibilityScore(result),
      biasScore: this.calculateBiasScore(),
      publishedDate: result.published_date ? this.parseDate(result.published_date) : undefined,
      extractedAt: new Date(),
    }));
  }

  private generateSummary(content: string): string {
    // Simple summary generation - first 200 characters
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  private calculateCredibilityScore(result: TavilySearchResult): number {
    // Basic credibility scoring based on domain and score
    let score = result.score || 0.5;
    
    // Boost score for known credible domains
    const credibleDomains = ['reuters.com', 'bbc.com', 'nature.com', 'science.org', 'arxiv.org'];
    if (credibleDomains.some(domain => result.url.includes(domain))) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private calculateBiasScore(): number {
    // Simple bias detection - neutral score for now
    // In a real implementation, this would use NLP analysis
    return 0.5;
  }

  private parseDate(dateString: string): Date | undefined {
    try {
      const parsedDate = new Date(dateString);
      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        return undefined;
      }
      return parsedDate;
    } catch (error) {
      console.warn('Error parsing date:', dateString, error);
      return undefined;
    }
  }

  private generateMockSources(query: string, maxResults: number, type: Source['type']): Source[] {
    const mockSources: Source[] = [];
    
    for (let i = 0; i < Math.min(maxResults, 3); i++) {
      mockSources.push({
        id: nanoid(),
        url: `https://example.com/${type}/${i + 1}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} result ${i + 1} for "${query}"`,
        content: `This is mock content for ${query}. In a real implementation, this would contain actual search results from ${type} sources. This content is generated for demonstration purposes and contains placeholder information about the search query.`,
        summary: `Mock summary for ${query} from ${type} source ${i + 1}`,
        type,
        credibilityScore: 0.7 + (Math.random() * 0.3),
        biasScore: 0.4 + (Math.random() * 0.2),
        publishedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
        extractedAt: new Date(),
      });
    }
    
    return mockSources;
  }
}
