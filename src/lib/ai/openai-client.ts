import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface OpenAIConfig {
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export const defaultConfig: OpenAIConfig = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

export interface OpenAIResponse<T> {
  data: T | null
  success: boolean
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class OpenAIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'OpenAIError'
  }
}

export async function callOpenAI<T>(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  config: Partial<OpenAIConfig> = {},
  schema?: any
): Promise<OpenAIResponse<T>> {
  try {
    const finalConfig = { ...defaultConfig, ...config }
    
    const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: finalConfig.model,
      messages,
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.maxTokens,
      top_p: finalConfig.topP,
      frequency_penalty: finalConfig.frequencyPenalty,
      presence_penalty: finalConfig.presencePenalty,
    }

    // Add structured output if schema is provided
    if (schema) {
      requestParams.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'funnel_response',
          schema,
          strict: true,
        },
      }
    }

    const completion = await openai.chat.completions.create(requestParams)
    
    const message = completion.choices[0]?.message
    if (!message?.content) {
      throw new OpenAIError('No content in response')
    }

    let data: T
    try {
      data = JSON.parse(message.content) as T
    } catch (parseError) {
      throw new OpenAIError(`Failed to parse JSON response: ${parseError}`)
    }

    return {
      data,
      success: true,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    if (error instanceof OpenAI.APIError) {
      return {
        data: null,
        success: false,
        error: `OpenAI API Error: ${error.message}`,
      }
    }
    
    if (error instanceof OpenAIError) {
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
  return !!process.env.OPENAI_API_KEY
}

export { openai } 