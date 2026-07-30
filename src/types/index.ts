export interface MsgItem {
  role: string
  content: string
  tag?: string
  marked?: string
}

export interface HistoryItem {
  id: string
  list: string // JSON-stringified MsgItem[]
  update_time: string
}

export interface ParseHistory extends HistoryItem {
  list: MsgItem[]
}

export interface TagItem {
  content: string
}

export interface Message {
  role: string
  content: string
}
