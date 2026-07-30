import type { Message } from '../types'

export type ApiFormat = 'openai' | 'anthropic' | 'gemini'

export interface ProviderConfig {
  id: string
  name: string
  description: string
  models: { id: string; label: string }[]
  endpoint: string
  defaultModel: string
  apiFormat: ApiFormat
  headers: (apiKey: string) => Record<string, string>
  buildBody: (model: string, messages: Message[], stream: boolean) => string
  parseSSEData: (data: Record<string, unknown>) => string | null
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: '使用 OpenAI 官方 API',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4.1',
    models: [
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
      { id: 'gpt-5', label: 'GPT-5' },
      { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { id: 'gpt-5-nano', label: 'GPT-5 Nano' },
      { id: 'o3', label: 'o3' },
      { id: 'o4-mini', label: 'o4-mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
    apiFormat: 'openai',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({ model, messages, stream }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined
      return choices?.[0]?.delta?.content || null
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: '使用 Anthropic 官方 API',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
      { id: 'claude-3.5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3.5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
    apiFormat: 'anthropic',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({
        model,
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream,
      }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      if (data.type === 'content_block_delta' && data.delta) {
        return (data.delta as { text?: string }).text || null
      }
      return null
    },
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: '使用 Google Gemini API',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ],
    apiFormat: 'gemini',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    buildBody: (model: string, messages: Message[], _stream: boolean) =>
      JSON.stringify({
        contents: messages.map(m => ({
          parts: [{ text: m.content }],
          role: m.role === 'assistant' ? 'model' : 'user',
        })),
      }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
      return candidates?.[0]?.content?.parts?.[0]?.text || null
    },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: '使用 DeepSeek 官方 API (Anthropic 兼容)',
    endpoint: 'https://api.deepseek.com/anthropic/v1/messages',
    defaultModel: 'deepseek-v4-pro',
    models: [
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
    ],
    apiFormat: 'anthropic',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({
        model,
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream,
      }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      if (data.type === 'content_block_delta' && data.delta) {
        return (data.delta as { text?: string }).text || null
      }
      return null
    },
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    description: '使用智谱 AI 开放平台',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultModel: 'glm-4-plus',
    models: [
      { id: 'glm-4-plus', label: 'GLM-4 Plus' },
      { id: 'glm-4-flash', label: 'GLM-4 Flash' },
      { id: 'glm-4-air', label: 'GLM-4 Air' },
      { id: 'glm-4', label: 'GLM-4' },
    ],
    apiFormat: 'openai',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({ model, messages, stream }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined
      return choices?.[0]?.delta?.content || null
    },
  },
  {
    id: 'moonshot',
    name: '月之暗面 Kimi',
    description: '使用 Moonshot AI (Kimi) 开放平台',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    defaultModel: 'moonshot-v1-8k',
    models: [
      { id: 'moonshot-v1-8k', label: 'Kimi 8K' },
      { id: 'moonshot-v1-32k', label: 'Kimi 32K' },
      { id: 'moonshot-v1-128k', label: 'Kimi 128K' },
    ],
    apiFormat: 'openai',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({ model, messages, stream }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined
      return choices?.[0]?.delta?.content || null
    },
  },
  {
    id: 'dashscope',
    name: '阿里云 DashScope Coding Plan',
    description: '使用阿里云 Coding Plan (Anthropic 兼容接口)',
    endpoint: 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages',
    defaultModel: 'qwen3.6-plus',
    models: [
      { id: 'qwen3.6-plus', label: 'Qwen 3.6 Plus' },
      { id: 'qwen3.7-plus', label: 'Qwen 3.7 Plus' },
      { id: 'qwen3.5-plus', label: 'Qwen 3.5 Plus' },
      { id: 'kimi-k2.5', label: 'Kimi K2.5' },
      { id: 'glm-5', label: 'GLM-5' },
      { id: 'glm-4.7', label: 'GLM-4.7' },
      { id: 'MiniMax-M2.5', label: 'MiniMax M2.5' },
      { id: 'qwen3-max-2026-01-23', label: 'Qwen3 Max' },
      { id: 'qwen3-coder-next', label: 'Qwen3 Coder Next' },
      { id: 'qwen3-coder-plus', label: 'Qwen3 Coder Plus' },
    ],
    apiFormat: 'anthropic',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({
        model,
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream,
      }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      if (data.type === 'content_block_delta' && data.delta) {
        return (data.delta as { text?: string }).text || null
      }
      return null
    },
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    description: '使用硅基流动 SiliconCloud',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    defaultModel: 'Qwen/Qwen3-235B-A22B',
    models: [
      { id: 'Qwen/Qwen3-235B-A22B', label: 'Qwen3 235B' },
      { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
      { id: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1' },
      { id: 'Pro/zai-org/GLM-4.7', label: 'GLM-4.7' },
      { id: 'Qwen/Qwen3-Max', label: 'Qwen3 Max' },
    ],
    apiFormat: 'openai',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({ model, messages, stream }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined
      return choices?.[0]?.delta?.content || null
    },
  },
  {
    id: 'groq',
    name: 'Groq',
    description: '使用 Groq 超快推理 API',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
    apiFormat: 'openai',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    buildBody: (model: string, messages: Message[], stream: boolean) =>
      JSON.stringify({ model, messages, stream }),
    parseSSEData: (data: Record<string, unknown>): string | null => {
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined
      return choices?.[0]?.delta?.content || null
    },
  },
]

export const DEFAULT_PROVIDER_ID = 'dashscope'

export function getProvider(id: string): ProviderConfig | undefined {
  return PROVIDERS.find(p => p.id === id)
}

export function getProviderModels(id: string): { id: string; label: string }[] {
  const provider = getProvider(id)
  return provider ? provider.models : PROVIDERS[0].models
}

export function getDefaultModel(providerId: string): string {
  const provider = getProvider(providerId)
  return provider ? provider.defaultModel : PROVIDERS[0].defaultModel
}
