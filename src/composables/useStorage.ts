import { storage } from '../utils/storage'
import type { TagItem } from '../types'
import { DEFAULT_MODEL } from '../api/chat'

export function useStorage() {
  const DEFAULT_TAGS: TagItem[] = [
    { content: '翻译成中文:' },
    { content: '翻译成英文:' },
    { content: '润色这段话:' },
  ]

  async function loadAll() {
    const data = await storage.get(['apikey', 'host', 'default_tag', 'isDark', 'tags', 'searchGpt', 'model'])
    return {
      apikey: data.apikey as string || '',
      host: data.host as string || '',
      defaultTag: data.default_tag as string || '',
      isDark: data.isDark as boolean || false,
      tags: Array.isArray(data.tags) ? data.tags : DEFAULT_TAGS,
      searchGpt: data.searchGpt as boolean || false,
      model: data.model as string || DEFAULT_MODEL,
    }
  }

  async function saveSettings(settings: { apikey: string; host: string; searchGpt: boolean }) {
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

  async function getSearchGpt(): Promise<boolean> {
    const data = await storage.get('searchGpt')
    return (data.searchGpt as boolean) || false
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
    getSearchGpt,
    saveModel,
  }
}
