"use client";

import { ResearchReport } from "@/lib/research/ai-agent";

interface AIResearchResult {
  success: boolean;
  query: string;
  depth: string;
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  structuredReport?: ResearchReport;
  timestamp: string;
}

interface ResearchResultsProps {
  result: AIResearchResult;
}

export function ResearchResults({ result }: ResearchResultsProps) {
  // const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'tools' | 'report'>('summary');

  const structuredReport = result.structuredReport;

  if (!structuredReport) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
        No structured report available. Displaying raw content:
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-left whitespace-pre-wrap">
          {result.content}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Research Analysis
      </h3>

      {/* Executive Summary */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">
          Executive Summary
        </h4>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700">
            {structuredReport.summary ||
              `Based on the research conducted on "${
                result.query
              }", we analyzed ${
                structuredReport.sources?.length || 0
              } sources across multiple categories. The research revealed key insights and perspectives that provide a comprehensive understanding of the topic.`}
          </p>
        </div>
      </div>

      {/* Key Findings / Perspectives */}
      {structuredReport.perspectives &&
        structuredReport.perspectives.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Key Perspectives
            </h4>
            <div className="space-y-3">
              {structuredReport.perspectives.map((perspective, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h5 className="font-medium text-gray-900 mb-2">
                    {perspective.viewpoint}
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {perspective.arguments.map((arg, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-gray-500">
                    Evidence: {perspective.evidence.join("; ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Detailed Findings (using raw content if structured report not fully popoulated) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">
          Detailed Findings
        </h4>
        <div className="prose prose-sm max-w-none text-gray-700">
          {result.content ||
            `Our research into "${result.query}" covered multiple aspects and sources. Key findings include various perspectives and evidence-based insights that provide a comprehensive view of the topic. Further analysis reveals important implications and considerations for understanding this subject matter.`}
        </div>
      </div>

      {/* Research Quality Indicators */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Research Quality
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-current">
              {structuredReport.sources?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Sources Analyzed</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-current">
              {Math.round(
                (structuredReport.sources?.reduce(
                  (acc, src) => acc + src.credibility,
                  0
                ) /
                  (structuredReport.sources?.length || 1)) *
                  100
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Avg. Credibility</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-current">
              {Math.round(
                (structuredReport.keyFindings?.reduce(
                  (acc, f) => acc + f.confidence,
                  0
                ) /
                  (structuredReport.keyFindings?.length || 1)) *
                  100
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Confidence Level</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {structuredReport.recommendations &&
        structuredReport.recommendations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Recommendations
            </h4>
            <div className="space-y-2">
              {structuredReport.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-green-600">✔</span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Research Gaps */}
      {structuredReport.limitations &&
        structuredReport.limitations.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Research Gaps Identified
            </h4>
            <div className="space-y-2">
              {structuredReport.limitations.map((gap, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-2 rounded"
                >
                  <span className="text-orange-600 mt-1">⚠</span>
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
