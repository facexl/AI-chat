import { storage } from '../utils/storage'
import type { TagItem } from '../types'

export function useStorage() {
  const DEFAULT_TAGS: TagItem[] = [
    { content: '翻译成中文:' },
    { content: '翻译成英文:' },
    { content: '润色这段话:' },
  ]

  async function loadAll() {
    const data = await storage.get(['apikey', 'provider', 'default_tag', 'isDark', 'tags', 'model'])
    return {
      apikey: data.apikey as string || '',
      provider: data.provider as string || 'dashscope',
      defaultTag: data.default_tag as string || '',
      isDark: data.isDark as boolean || false,
      tags: Array.isArray(data.tags) ? data.tags : DEFAULT_TAGS,
      model: data.model as string || '',
    }
  }

  async function saveSettings(settings: { apikey: string; provider: string }) {
    return storage.set(settings)
  }

  async function saveTags(tags: TagItem[]) {
    return storage.set({ tags })
  }

  async function saveDarkMode(isDark: boolean) {
    return storage.set({ isDark })
  }

  async function saveDefaultTag(tag: string) {
    return storage.set({ default_tag: tag })
  }

  async function saveModel(model: string) {
    return storage.set({ model })
  }

  return {
    DEFAULT_TAGS,
    loadAll,
    saveSettings,
    saveTags,
    saveDarkMode,
    saveDefaultTag,
    saveModel,
  }
}
