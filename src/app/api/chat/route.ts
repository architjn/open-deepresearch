import { streamText } from 'ai';
import { getAIModel } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { messages, provider = 'openai' } = await req.json();

    // Get the AI model based on the provider
    const model = getAIModel(provider as any);

    // Configure parameters based on model type
    const isO1Model = provider === 'o1-mini-deep-research';
    
    const streamConfig: any = {
      model,
      messages,
    };
    
    // o1 models don't support system messages, temperature, or maxTokens
    if (!isO1Model) {
      streamConfig.system = `You are a deep research AI agent designed to help users conduct thorough research on any topic. 
      
Your capabilities include:
- Analyzing complex topics from multiple perspectives
- Providing comprehensive research insights
- Breaking down complex information into digestible parts
- Suggesting further research directions
- Maintaining academic rigor and citing sources when possible

Always strive to provide well-structured, informative responses that help users understand topics deeply.`;
      streamConfig.maxTokens = 4000;
      streamConfig.temperature = 0.7;
    } else {
      // For o1 models, add system instructions as a user message if needed
      const hasSystemInstructions = messages.some((msg: any) => msg.role === 'system');
      if (!hasSystemInstructions && messages.length > 0) {
        streamConfig.messages = [
          {
            role: 'user',
            content: `Please act as a deep research AI agent. Analyze topics from multiple perspectives, provide comprehensive insights, break down complex information, suggest further research directions, and maintain academic rigor. Now, please help with: ${messages[messages.length - 1].content}`
          },
          ...messages.slice(0, -1)
        ];
      }
    }

    // Create a streaming response
    const result = await streamText(streamConfig);

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
