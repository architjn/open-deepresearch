"use client";

import { ResearchReport } from "@/lib/research/ai-agent";
import { useState } from "react";
import { ResearchResults } from "./ResearchResults";

interface ResearchResult {
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

export function ResearchInterface() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<"surface" | "deep">("deep");
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsResearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/research/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          depth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Research failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Deep Research Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powered by advanced AI agents with specialized research tools for
            comprehensive analysis from multiple sources
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Research Query
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to research? The AI agent will automatically use multiple tools including web search, academic papers, news sources, credibility analysis, and synthesis..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500 text-gray-900"
              rows={4}
              disabled={isResearching}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Research Depth
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["surface", "deep"] as const).map((level) => (
                <label
                  key={level}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    depth === level
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={level}
                    checked={depth === level}
                    onChange={(e) => setDepth(e.target.value as typeof depth)}
                    className="mt-1 mr-3"
                    disabled={isResearching}
                  />
                  <div>
                    <div className="font-medium text-lg capitalize mb-1 text-gray-900">
                      {level} Research
                    </div>
                    <p className="text-sm text-gray-600">
                      {level === "surface"
                        ? "Quick overview with 2-3 AI tools for fast insights and key facts"
                        : "Comprehensive analysis using all available AI tools with deep cross-referencing, credibility analysis, and multi-perspective synthesis"}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Tools:{" "}
                      {level === "surface"
                        ? "Web Search, Academic Search"
                        : "Web Search, Academic Search, News Search, Credibility Analysis, Synthesis"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isResearching || !query.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg"
          >
            {isResearching ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                🤖 AI Agent Working...
              </>
            ) : (
              "🚀 Launch AI Research Agent"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8">
          <ResearchResults result={result} />
        </div>
      )}
    </div>
  );
}
