import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openrouter } from '@openrouter/ai-sdk-provider';

// Configure AI providers
export const aiProviders = {
  openai: {
    model: openai('gpt-4o'),
    name: 'OpenAI GPT-4o',
  },
  anthropic: {
    model: anthropic('claude-3-5-sonnet-20241022'),
    name: 'Claude 3.5 Sonnet',
  },
  google: {
    model: google('gemini-1.5-pro'),
    name: 'Gemini 1.5 Pro',
  },
  openrouter: {
    model: openrouter('anthropic/claude-3.5-sonnet'),
    name: 'OpenRouter (Claude 3.5 Sonnet)',
  },
  'openrouter-gpt4': {
    model: openrouter('openai/gpt-4o'),
    name: 'OpenRouter (GPT-4o)',
  },
  'openrouter-gemini': {
    model: openrouter('google/gemini-pro-1.5'),
    name: 'OpenRouter (Gemini Pro 1.5)',
  },
  'o1-mini-deep-research': {
    model: openai('o1-mini'),
    name: 'OpenAI o1-mini (Deep Research)',
  },
};

// Default provider (can be changed based on user preference or task)
export const defaultProvider = 'openai';

// Helper function to get AI model by provider name
export function getAIModel(provider: keyof typeof aiProviders = defaultProvider) {
  return aiProviders[provider]?.model || aiProviders[defaultProvider].model;
}

// Helper function to get all available providers
export function getAvailableProviders() {
  return Object.entries(aiProviders).map(([key, value]) => ({
    id: key,
    name: value.name,
  }));
}
