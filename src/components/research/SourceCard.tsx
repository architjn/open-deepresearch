'use client';

import React from 'react';
import { Source } from '@/types/research';

interface SourceCardProps {
  source: Source;
}

export function SourceCard({ source }: SourceCardProps) {
  const getTypeColor = (type: Source['type']) => {
    switch (type) {
      case 'web':
        return 'bg-blue-100 text-blue-800';
      case 'news':
        return 'bg-red-100 text-red-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-green-100 text-green-800';
      case 'government':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    
    // Check if the date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(source.type)}`}>
          {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${getCredibilityColor(source.credibilityScore)}`}>
            {Math.round(source.credibilityScore * 100)}%
          </span>
          <span className="text-gray-500">credibility</span>
        </div>
      </div>

      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
        {source.title}
      </h4>

      <p className="text-xs text-gray-600 mb-3 line-clamp-3">
        {source.summary}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {source.publishedDate && (
            <span>{formatDate(source.publishedDate)}</span>
          )}
          {source.author && (
            <span>• {source.author}</span>
          )}
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View →
        </a>
      </div>
    </div>
  );
}
