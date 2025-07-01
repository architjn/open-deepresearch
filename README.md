# Open Deep Research AI Agent

A Next.js application powered by the AI SDK for conducting deep research on any topic using multiple AI providers.

## Features

- 🤖 Multiple AI provider support (OpenAI, Anthropic, Google, OpenRouter)
- 💬 Streaming chat interface
- 🔍 Deep research capabilities
- 🎨 Clean, responsive UI with Tailwind CSS
- ⚡ Built with Next.js 15 and TypeScript

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.local` file and add your API keys:

```bash
# In .env.local, uncomment and add your API keys:

# OpenAI (recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google AI (optional)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# OpenRouter (optional - provides access to many models)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Get API Keys

#### OpenAI (Recommended for getting started)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env.local` file

#### Anthropic (Optional)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add it to your `.env.local` file

#### Google AI (Optional)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env.local` file

#### OpenRouter (Optional)
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Add it to your `.env.local` file
4. OpenRouter provides access to many models through a single API

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Select your preferred AI provider from the dropdown
2. Ask any research question
3. Get comprehensive, well-structured responses
4. Continue the conversation to dive deeper into topics

## AI Providers

- **OpenAI GPT-4o**: Excellent for general research and analysis
- **Claude 3.5 Sonnet**: Great for detailed analysis and academic research
- **Gemini 1.5 Pro**: Strong at technical topics and code analysis
- **OpenAI o1-mini (Deep Research)**: Advanced reasoning model optimized for deep research tasks
- **OpenRouter (Claude 3.5 Sonnet)**: Access Claude through OpenRouter
- **OpenRouter (GPT-4o)**: Access GPT-4o through OpenRouter
- **OpenRouter (Gemini Pro 1.5)**: Access Gemini through OpenRouter

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # Chat API endpoint
│   └── page.tsx             # Main application page
├── components/
│   └── chat.tsx             # Chat interface component
└── lib/
    └── ai.ts                # AI provider configuration
```

## Technologies Used

- [Next.js 15](https://nextjs.org/) - React framework
- [AI SDK](https://sdk.vercel.ai/) - AI integration
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zod](https://zod.dev/) - Schema validation

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
