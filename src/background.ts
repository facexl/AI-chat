chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type !== 'API_FETCH') return false

  fetch(request.url, {
    method: 'POST',
    headers: request.headers || {},
    body: request.body,
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text()
      let errorMsg = `HTTP ${response.status}`
      try {
        const errData = JSON.parse(text)
        errorMsg = errData.error?.message || errData.message || errorMsg
      } catch { /* ignore */ }
      sendResponse({ ok: false, error: errorMsg })
      return
    }

    if (!response.body) {
      sendResponse({ ok: false, error: 'Empty response body' })
      return
    }

    // Send the port name so content script can connect to it
    const streamId = 'stream-' + Date.now()
    sendResponse({ ok: true, stream: true, streamId })

    // Wait for content script to connect, then stream raw SSE data lines
    chrome.runtime.onConnect.addListener(function streamListener(port) {
      if (port.name !== streamId) return
      chrome.runtime.onConnect.removeListener(streamListener)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      async function pump() {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              port.postMessage({ type: 'done' })
              port.disconnect()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data:')) continue

              const jsonStr = trimmed.slice(5).trim()
              if (jsonStr === '[DONE]') {
                port.postMessage({ type: 'done' })
                port.disconnect()
                return
              }

              // Pass raw JSON data to content script for provider-specific parsing
              port.postMessage({ type: 'data', data: jsonStr })
            }
          }
        } catch (err) {
          port.postMessage({ type: 'error', error: String(err) })
          port.disconnect()
        }
      }

      pump()
    })
  }).catch((err) => {
    sendResponse({ ok: false, error: String(err) })
  })

  return true // Async response
})
