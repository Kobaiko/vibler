export interface ReplicateConfig {
  model: string
  temperature: number
  maxTokens: number
}

export const defaultConfig: ReplicateConfig = {
  model: 'openai/gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 4000,
}

export interface ReplicateResponse<T> {
  data: T | null
  success: boolean
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class ReplicateError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ReplicateError'
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callReplicate<T>(
  messages: ChatMessage[],
  config: Partial<ReplicateConfig> = {},
  schema?: any
): Promise<ReplicateResponse<T>> {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN
    if (!apiKey) {
      throw new ReplicateError(
        'Replicate API key is not configured. Please set the REPLICATE_API_TOKEN environment variable.',
        'MISSING_API_KEY',
        401
      )
    }

    const finalConfig = { ...defaultConfig, ...config }
    
    // Convert messages to a single prompt
    const prompt = messages.map(msg => {
      if (msg.role === 'system') {
        return `System: ${msg.content}`
      } else if (msg.role === 'user') {
        return `User: ${msg.content}`
      } else {
        return `Assistant: ${msg.content}`
      }
    }).join('\n\n')

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: finalConfig.model,
        input: {
          prompt: prompt,
          max_tokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ReplicateError(`Replicate request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    // Poll for completion
    let pollResult = result;
    while (pollResult.status !== 'succeeded' && pollResult.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${pollResult.id}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });
      
      if (!pollResponse.ok) {
        throw new ReplicateError(`Polling failed: ${pollResponse.status}`);
      }
      
      pollResult = await pollResponse.json();
      
      if (pollResult.status === 'failed') {
        throw new ReplicateError(`Generation failed: ${pollResult.error}`);
      }
    }

    const content = pollResult.output;
    if (!content) {
      throw new ReplicateError('No content in response')
    }

    let data: T
    try {
      // Handle array output from Replicate (join to string)
      let rawContent = Array.isArray(content) ? content.join('') : content;
      if (typeof rawContent !== 'string') {
        rawContent = String(rawContent);
      }
      
      // Clean the response content to handle markdown formatting
      let cleanContent = rawContent.trim()
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      data = JSON.parse(cleanContent) as T
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      console.error('Raw content:', content)
      throw new ReplicateError(`Failed to parse JSON response: ${parseError}`)
    }

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error('Replicate API Error:', error)
    
    if (error instanceof ReplicateError) {
      return {
        data: null,
        success: false,
        error: error.message,
      }
    }
    
    return {
      data: null,
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export function validateApiKey(): boolean {
  return !!process.env.REPLICATE_API_TOKEN
}

// For backward compatibility, export callReplicate as callOpenAI
export const callOpenAI = callReplicate

// Legacy OpenAI types for backward compatibility
export interface OpenAIConfig extends ReplicateConfig {}
export interface OpenAIResponse<T> extends ReplicateResponse<T> {}
export const OpenAIError = ReplicateError 