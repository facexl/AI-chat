<template>
  <div class="history-overlay">
    <div class="history-list">
      <div
        v-for="(item, i) in list"
        :key="item.id"
        class="history-item"
        @click="$emit('select', item)"
      >
        <div class="preview">{{ item.list[0]?.content || '(空)' }}</div>
        <div class="time">更新: {{ item.update_time }}</div>
        <div class="delete-btn" @click.stop="remove(i)">X</div>
      </div>
      <div v-if="list.length === 0" class="empty">暂无历史记录</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storage } from '../utils/storage'
import type { ParseHistory } from '../types'

const emit = defineEmits<{
  select: [item: ParseHistory]
  close: []
}>()

const list = ref<ParseHistory[]>([])

async function remove(index: number) {
  const records = await storage.getHistory()
  records.splice(index, 1)
  await storage.setHistory(records)
  list.value.splice(index, 1)
}

onMounted(async () => {
  const records = await storage.getHistory()
  const parsed: ParseHistory[] = []
  for (const it of records) {
    try {
      parsed.push({ ...it, list: JSON.parse(it.list) })
    } catch {
      // skip corrupted entries
    }
  }
  list.value = parsed
})
</script>

<style lang="less" scoped>
.history-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--ai-chat-bg);
  color: var(--ai-chat-font-color);
  z-index: 2;
  padding-top: 30px;
  box-sizing: border-box;
}
.history-list {
  height: 100%;
  overflow-y: auto;
}
.history-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid var(--light-border-gray);
  gap: 8px;
}
.preview {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  color: #e96900;
  font-size: 11px;
  white-space: nowrap;
  background-color: var(--history-gray);
  padding: 2px 6px;
  border-radius: 3px;
}
.delete-btn {
  color: #f50;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
}
.empty {
  text-align: center;
  padding: 24px;
  color: #999;
}
</style>
