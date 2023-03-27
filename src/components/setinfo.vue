<template>
  <div class="ai-chat-set-info absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
    <div class="w-400px">
      <span>请输入您在 openai 申请的 apikey:</span>
      <a-input
        v-model:value="state.apikey"
        addon-before="openai apikey"
        placeholder="please input openai apikey"
        class="mt-16px"
      />
      <a-input
        v-model:value="state.host"
        class="mt-16px mb-16px"
        addon-before="proxy host &nbsp;&nbsp;&nbsp;&nbsp;"
        placeholder="please input host"
      />
      <span>是否开启 百度/google/bing 搜索同时询问 chatGpt: </span>
      <a-switch v-model:checked="state.searchGpt" />
      <div
        style="display: flex;justify-content: center;"
        class="mt-16px"
      >
        <a-button
          type="default"
          class="mr-8px"
          @click="$emit('toogle')"
        >
          取消
        </a-button>
        <a-button
          type="primary"
          @click="submit"
        >
          确定
        </a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { storage } from '../utils'
import config from '../config'
  
const state = reactive({
  apikey:'',
  host:config.host,
  searchGpt:false
})

const emits = defineEmits(['toogle','fresh'])
  

onMounted(async ()=>{

  const keys = Object.keys(state)
  
  const d = await storage.get(keys);

  keys.forEach(it=>{
    if(d[it]){
      state[it] = d[it]
    }
  })
})
    
const submit=async ()=>{
  
  await storage.set(state)

  emits('toogle')

  emits('fresh')
}
  
</script>
<style lang="less" scoped>
.ai-chat-set-info{
    background-color: var(--ai-chat-bg);
    color:var(--ai-chat-font-color);
    z-index:2;
}
</style>