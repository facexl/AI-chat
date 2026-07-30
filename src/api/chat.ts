import type { Message } from '../types'
import type { ProviderConfig } from './providers'

/**
 * Build the full endpoint URL from the provider config.
 * Gemini uses a special URL structure: endpoint/model:streamGenerateContent?alt=sse&key=API_KEY
 */
function buildUrl(provider: ProviderConfig, model: string, apiKey: string): string {
  if (provider.apiFormat === 'gemini') {
    return `${provider.endpoint}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`
  }
  return provider.endpoint
}

export async function* streamChat(
  messages: Message[],
  apiKey: string,
  model: string,
  provider: ProviderConfig,
): AsyncGenerator<string, void, unknown> {
  const url = buildUrl(provider, model, apiKey)
  const body = provider.buildBody(model, messages, true)
  const headers = provider.headers(apiKey)

  // Proxy through background service worker for true streaming
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response: { ok: boolean; error?: string; stream?: boolean; streamId?: string } =
      await chrome.runtime.sendMessage({
        type: 'API_FETCH',
        url,
        headers,
        body,
      })

    if (!response.ok) {
      throw new Error(response.error || 'Fetch failed')
    }

    if (response.stream && response.streamId) {
      const port = chrome.runtime.connect({ name: response.streamId })
      yield* portToAsyncIterable(port, provider)
      return
    }

    throw new Error('Stream setup failed')
  }

  // Fallback: direct fetch (dev mode without extension)
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })

  if (res.status !== 200) {
    let errorMsg = `HTTP ${res.status}`
    try {
      const errData = await res.json()
      errorMsg = (errData as Record<string, unknown>).error as string
        || (errData as Record<string, unknown>).message as string
        || errorMsg
    } catch { /* ignore */ }
    throw new Error(errorMsg)
  }

  if (res.body) {
    yield* parseSSEStream(res.body.getReader(), provider)
  }
}

/**
 * Convert a Chrome runtime port into an async iterable of text tokens.
 * Content script-side SSE parsing - background sends raw data: line JSON.
 */
async function* portToAsyncIterable(
  port: chrome.runtime.Port,
  provider: ProviderConfig,
): AsyncGenerator<string, void, unknown> {
  const queue: Array<{ value: string } | { error: Error }> = []
  let resolveNext: ((result: IteratorResult<string, void>) => void) | null = null
  let streamEnded = false

  port.onMessage.addListener((msg: { type: string; data?: string; error?: string }) => {
    if (msg.type === 'data' && msg.data) {
      try {
        const json = JSON.parse(msg.data)
        const token = provider.parseSSEData(json)
        if (token) {
          const item = { value: token }
          if (resolveNext) {
            resolveNext(item)
            resolveNext = null
          } else {
            queue.push(item)
          }
        }
      } catch {
        // skip malformed JSON
      }
    } else if (msg.type === 'done') {
      streamEnded = true
      if (resolveNext) {
        resolveNext({ value: undefined as any, done: true })
        resolveNext = null
      }
      port.disconnect()
    } else if (msg.type === 'error') {
      queue.push({ error: new Error(msg.error || 'Stream error') })
      if (resolveNext) {
        resolveNext({ value: undefined as any, done: false })
        resolveNext = null
      }
      streamEnded = true
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

    // Check queue for errors that may have arrived during await
    if (queue.length > 0) {
      const item = queue.shift()!
      if ('error' in item) throw item.error
      // Re-insert token at front of queue, yield result first
      queue.unshift(item)
    }

    yield result.value
  }
}

/**
 * SSE stream parser (dev mode fallback, no service worker).
 * Parses on the client side using provider's parseSSEData.
 */
async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  provider: ProviderConfig,
): AsyncGenerator<string, void, unknown> {
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
        const token = provider.parseSSEData(event)
        if (token) yield token
      } catch {
        // skip malformed lines
      }
    }
  }
}
