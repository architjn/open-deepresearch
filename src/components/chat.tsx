'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { getAvailableProviders } from '@/lib/ai';

export default function Chat() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const providers = getAvailableProviders();

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      provider: selectedProvider,
    },
  });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Deep Research AI Agent
        </h1>
        <div className="flex items-center gap-4">
          <label htmlFor="provider" className="text-sm font-medium text-gray-700">
            AI Provider:
          </label>
          <select
            id="provider"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <h2 className="text-xl font-semibold mb-2">Welcome to Deep Research AI</h2>
            <p>Ask me anything you&apos;d like to research deeply. I can help you:</p>
            <ul className="mt-2 text-left max-w-md mx-auto">
              <li>• Analyze complex topics from multiple angles</li>
              <li>• Provide comprehensive research insights</li>
              <li>• Break down complicated subjects</li>
              <li>• Suggest further research directions</li>
            </ul>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-8'
                  : 'bg-gray-100 mr-8'
              }`}
            >
              <div className="font-semibold mb-1 text-gray-900">
                {message.role === 'user' ? 'You' : 'AI Researcher'}
              </div>
              <div className="whitespace-pre-wrap text-gray-800">{message.content}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-100 mr-8 p-4 rounded-lg">
            <div className="font-semibold mb-1 text-gray-900">AI Researcher</div>
            <div className="flex items-center">
              <div className="animate-pulse text-gray-700">Researching...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="What would you like to research today?"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Researching...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
