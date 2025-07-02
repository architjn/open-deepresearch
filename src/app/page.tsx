import { ResearchInterface } from '@/components/research/ResearchInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Open Deep Research</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conduct comprehensive, AI-powered research on any topic with multi-source analysis, 
            fact-checking, and detailed insights.
          </p>
        </div>
        <ResearchInterface />
      </div>
    </main>
  );
}
