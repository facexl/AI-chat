import { streamChat } from '../api/chat'
import { getProvider } from '../api/providers'
import { renderMarkdown } from '../utils/markdown'
import { storage } from '../utils/storage'
import type { MsgItem } from '../types'

export function useChat() {
  const msgs = ref<MsgItem[]>([])
  const reqing = ref(false)
  const chatThreadId = ref(storage.keyer.key)
  const errorMsg = ref('')

  function addUserMessage(content: string, tag?: string) {
    msgs.value.push({
      role: 'user',
      content,
      tag,
    })
  }

  function addAssistantMessage() {
    msgs.value.push({
      role: 'assistant',
      content: '',
    })
  }

  function updateLastMessage(content: string, _taggedContent: string) {
    const last = msgs.value[msgs.value.length - 1]
    if (last && last.role === 'assistant') {
      const fullContent = content
      msgs.value.splice(msgs.value.length - 1, 1, {
        role: last.role,
        content: fullContent,
        marked: renderMarkdown(fullContent),
        tag: last.tag,
      })
    }
  }

  async function sendRequest(apiKey: string, providerId: string, model: string) {
    if (reqing.value) {
      errorMsg.value = '请等待上一条回复完成'
      return
    }

    const provider = getProvider(providerId)
    if (!provider) {
      errorMsg.value = '无效的模型提供商'
      return
    }

    const messages = msgs.value.map((it) => ({
      role: it.role,
      content: it.tag ? it.tag + it.content : it.content,
    }))

    addAssistantMessage()
    reqing.value = true
    errorMsg.value = ''

    let fullContent = ''

    try {
      const gen = streamChat(messages, apiKey, model, provider)

      for await (const chunk of gen) {
        fullContent += chunk
        updateLastMessage(fullContent, chunk)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '网络请求失败'
      errorMsg.value = msg
    } finally {
      reqing.value = false
    }
  }

  function clearThread() {
    chatThreadId.value = storage.keyer.key
    msgs.value = []
  }

  function loadHistory(item: { id: string; list: MsgItem[] }) {
    chatThreadId.value = item.id
    msgs.value = item.list
  }

  async function saveThread() {
    const old = await storage.getHistory()
    const d = new Date()
    const update_time = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
    const filtered = old.filter((it) => it.id !== chatThreadId.value)
    const newList = [
      {
        id: chatThreadId.value,
        list: JSON.stringify(msgs.value),
        update_time,
      },
      ...filtered,
    ]
    await storage.setHistory(newList)
    errorMsg.value = '保存成功'
  }

  return {
    msgs,
    reqing,
    chatThreadId,
    errorMsg,
    addUserMessage,
    addAssistantMessage,
    sendRequest,
    clearThread,
    loadHistory,
    saveThread,
  }
}
