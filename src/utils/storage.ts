import type { HistoryItem } from '../types'

export const isExtension = !!(typeof chrome !== 'undefined' && chrome.storage)

type StorageValue = string | number | boolean | object | null | undefined

async function get(keys: string | string[]): Promise<Record<string, StorageValue>> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => resolve(result as Record<string, StorageValue>))
    })
  }

  const ks = Array.isArray(keys) ? keys : [keys]
  const result: Record<string, StorageValue> = {}
  for (const k of ks) {
    try {
      const raw = localStorage.getItem(k)
      result[k] = raw ? JSON.parse(raw) : undefined
    } catch {
      result[k] = undefined
    }
  }
  return result
}

async function set(items: Record<string, StorageValue>): Promise<void> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => resolve())
    })
  }

  for (const [k, v] of Object.entries(items)) {
    if (v === undefined || v === null) {
      localStorage.removeItem(k)
    } else {
      localStorage.setItem(k, JSON.stringify(v))
    }
  }
}

const keyer = (() => {
  let current = 0
  const prefix = String(Math.random()).substring(2, 6) + String(+new Date())
  return {
    get key() {
      current++
      return `${prefix}k${current}`
    },
  }
})()

async function getHistory(): Promise<HistoryItem[]> {
  const data = await get('chatRecord')
  return data.chatRecord as HistoryItem[] || []
}

async function setHistory(list: HistoryItem[]): Promise<void> {
  await set({ chatRecord: list })
}

export const storage = {
  get,
  set,
  keyer,
  getHistory,
  setHistory,
}
