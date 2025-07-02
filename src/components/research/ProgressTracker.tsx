'use client';

import React from 'react';
import { ResearchResult } from '@/types/research';

interface ProgressTrackerProps {
  research: ResearchResult;
}

export function ProgressTracker({ research }: ProgressTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'running':
        return '◯';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Research Progress</h3>
        <div className="text-sm text-gray-600">
          {Math.round(research.progress)}% Complete
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${research.progress}%` }}
          />
        </div>
      </div>

      {/* Research Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Research Steps:</h4>
        {research.steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className={`text-lg ${getStatusColor(step.status)}`}>
              {getStatusIcon(step.status)}
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {step.description}
              </div>
              {step.findings && step.findings.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  {step.findings[0]}
                </div>
              )}
              {step.error && (
                <div className="text-xs text-red-600 mt-1">
                  Error: {step.error}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {step.status === 'running' && (
                <div className="animate-pulse">Running...</div>
              )}
              {step.status === 'completed' && step.endTime && (
                <div>
                  {new Date(step.endTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Research Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium text-gray-900 capitalize">
              {research.status}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Sources</div>
            <div className="font-medium text-gray-900">
              {research.totalSources}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Depth</div>
            <div className="font-medium text-gray-900 capitalize">
              {research.request.depth}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Started</div>
            <div className="font-medium text-gray-900">
              {new Date(research.startTime).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
