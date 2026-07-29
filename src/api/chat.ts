import type { DashScopeMessage } from '../types'

const API_ENDPOINT = 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages'

export const MODELS = [
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
]

export const DEFAULT_MODEL = 'qwen3.6-plus'

export async function* streamChat(
  messages: DashScopeMessage[],
  apiKey: string,
  host: string,
  model: string,
): AsyncGenerator<string, void, unknown> {
  const endpoint = host || API_ENDPOINT

  const body = JSON.stringify({
    model,
    max_tokens: 1000,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  })

  // Proxy through background service worker for true streaming
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response: { ok: boolean; error?: string; stream?: boolean; streamId?: string } =
      await chrome.runtime.sendMessage({
        type: 'API_FETCH',
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body,
      })

    if (!response.ok) {
      throw new Error(response.error || 'Fetch failed')
    }

    if (response.stream && response.streamId) {
      // Connect to the stream port
      const port = chrome.runtime.connect({ name: response.streamId })
      yield* portToAsyncIterable(port)
      return
    }

    throw new Error('Stream setup failed')
  }

  // Fallback: direct fetch (dev mode without extension)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
  })

  if (res.status !== 200) {
    let errorMsg = `HTTP ${res.status}`
    try {
      const errData = await res.json()
      errorMsg = errData.error?.message || errData.message || errData.code || errorMsg
    } catch { /* ignore */ }
    throw new Error(errorMsg)
  }

  if (res.body) {
    yield* parseSSEStream(res.body.getReader())
  }
}

/**
 * Convert a Chrome runtime port into an async iterable of tokens.
 */
async function* portToAsyncIterable(port: chrome.runtime.Port): AsyncGenerator<string, void, unknown> {
  const queue: Array<{ value: string } | { error: Error }> = []
  let resolveNext: ((result: IteratorResult<string, void>) => void) | null = null
  let streamEnded = false

  port.onMessage.addListener((msg: { type: string; data?: string; error?: string }) => {
    if (msg.type === 'token' && msg.data) {
      if (resolveNext) {
        resolveNext({ value: msg.data, done: false })
        resolveNext = null
      } else {
        queue.push({ value: msg.data })
      }
    } else if (msg.type === 'done') {
      streamEnded = true
      if (resolveNext) {
        resolveNext({ value: undefined as any, done: true })
        resolveNext = null
      }
      port.disconnect()
    } else if (msg.type === 'error') {
      const err = new Error(msg.error || 'Stream error')
      if (resolveNext) {
        resolveNext = Promise.reject(err) as any
        resolveNext = null
      } else {
        queue.push({ error: err })
      }
      port.disconnect()
    }
  })

  port.onDisconnect.addListener(() => {
    if (!streamEnded && resolveNext) {
      resolveNext({ value: undefined as any, done: true })
      resolveNext = null
    }
    streamEnded = true
  })

  while (true) {
    if (queue.length > 0) {
      const item = queue.shift()!
      if ('error' in item) throw item.error
      yield item.value
      continue
    }

    if (streamEnded) return

    const result = await new Promise<IteratorResult<string, void>>((resolve) => {
      resolveNext = resolve
    })

    if (result.done) return
    yield result.value
  }
}

async function* parseSSEStream(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string, void, unknown> {
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue

      const jsonStr = trimmed.slice(5).trim()
      if (jsonStr === '[DONE]') return

      try {
        const event = JSON.parse(jsonStr)
        if (event.type === 'content_block_delta' && event.delta?.text) {
          yield event.delta.text
        }
      } catch {
        // skip
      }
    }
  }
}
