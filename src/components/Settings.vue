<template>
  <div class="settings-overlay">
    <div class="settings-form">
      <label class="text-sm">选择模型提供商:</label>
      <div class="settings-field">
        <select v-model="form.provider" class="provider-select">
          <option v-for="p in PROVIDERS" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>

      <label class="text-sm mt-16">请输入 API Key:</label>
      <div class="settings-field">
        <input
          v-model="form.apikey"
          class="native-input"
          :placeholder="`请输入 ${selectedProvider?.name} API Key`"
          style="width: 100%"
        />
      </div>

      <div class="settings-divider" />

      <div class="platform-info">
        <div class="platform-title">平台说明</div>
        <div class="platform-desc" v-if="selectedProvider">{{ selectedProvider.description }}</div>
        <div class="platform-desc mt-8">支持的模型:</div>
        <div class="model-list">
          <span v-for="m in selectedProvider?.models" :key="m.id" class="model-tag">{{ m.label }}</span>
        </div>
      </div>

      <div class="settings-actions">
        <button class="native-btn" @click="$emit('close')">取消</button>
        <button class="native-btn native-btn-primary" @click="submit">确定</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStorage } from '../composables/useStorage'
import { PROVIDERS, getProvider } from '../api/providers'
import type { ProviderConfig } from '../api/providers'

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { loadAll, saveSettings } = useStorage()

const form = reactive({
  apikey: '',
  provider: 'dashscope',
})

const selectedProvider = computed<ProviderConfig | undefined>(() => getProvider(form.provider))

onMounted(async () => {
  const data = await loadAll()
  form.apikey = data.apikey
  form.provider = data.provider
})

async function submit() {
  await saveSettings({
    apikey: form.apikey,
    provider: form.provider,
  })
  emit('close')
  emit('saved')
}
</script>

<style lang="less" scoped>
.settings-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--ai-chat-bg);
  color: var(--ai-chat-font-color);
  z-index: 2;
  overflow-y: auto;
  padding: 24px 0;
  margin-top:30px;
}

.settings-form {
  width: 360px;
}

.settings-field {
  margin-top: 8px;
}

.provider-select {
  box-sizing: border-box;
  height: 32px;
  padding: 4px 11px;
  font-size: 14px;
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
  color: rgba(0, 0, 0, 0.88);
  background: #fff;
  cursor: pointer;
  &:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1); }
}

.mt-8 { margin-top: 8px; }
.mt-16 { margin-top: 16px; }

.settings-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.settings-divider {
  height: 1px;
  background: var(--ai-chat-font-color);
  opacity: 0.12;
  margin: 16px 0;
}

.platform-info {
  font-size: 13px;
}

.platform-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.platform-desc {
  color: var(--ai-chat-font-color);
  opacity: 0.75;
  margin-bottom: 8px;
}

.model-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.model-tag {
  display: inline-block;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  font-size: 11px;
  border-radius: 3px;
  border: 1px solid var(--light-border-gray, #f0f0f0);
  background: var(--ai-chat-bg);
  color: var(--ai-chat-font-color);
  opacity: 0.65;
}

.text-sm {
  font-size: 14px;
}
</style>
