import React, { useRef } from 'react';
import { ResearchResult, ResearchStep, ResearchLogEntry } from '@/types/research';

interface ResearchProgressDisplayProps {
  researchResult: ResearchResult;
}

const ResearchProgressDisplay: React.FC<ResearchProgressDisplayProps> = ({ researchResult }) => {
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToStep = (stepId: string) => {
    stepRefs.current[stepId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex h-full">
      {/* Left Panel: Steps/Tabs */}
      <div className="w-1/4 p-4 border-r border-gray-200 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Research Steps</h3>
        <ul>
          {researchResult.steps.map((step) => (
            <li key={step.id} className="mb-2">
              <button
                onClick={() => scrollToStep(step.id)}
                className="text-left w-full p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                // Add active styling based on current scroll position or active step
              >
                {step.phase || step.description}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel: Detailed Logs */}
      <div className="w-3/4 p-4 overflow-y-auto">
        {researchResult.steps.map((step: ResearchStep) => (
          <div key={step.id} id={step.id} ref={(el: HTMLDivElement | null) => { stepRefs.current[step.id] = el; }} className="mb-8">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-background py-2">{step.phase || step.description}</h2>
            <div className="space-y-2">
              {step.logs?.map((log: ResearchLogEntry) => (
                <div key={log.timestamp} className="bg-gray-800 p-3 rounded-md text-sm">
                  <span className="text-gray-200 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-medium ${log.type === 'error' ? 'text-red-600' : ''}`}>
                    {log.type.toUpperCase()}:
                  </span>{' '}
                  {log.message}
                  {log.details && (
                    <pre className="mt-1 text-xs text-gray-300 bg-gray-700 p-2 rounded-md overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchProgressDisplay;
