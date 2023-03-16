<template>
  <div class="ai-chat-set-info w-80% m-auto">
    <a-input
      v-model:value="state.apikey"
      addon-before="openai apikey"
      placeholder="please input openai apikey"
      class="mt-16px"
    />
    <a-input
      v-model:value="state.host"
      class="mt-16px"
      addon-before="proxy host &nbsp;&nbsp;&nbsp;&nbsp;"
      placeholder="please input host"
    />
    <div
      style="display: flex;justify-content: center;"
      class="mt-16px"
    >
      <a-button
        type="default"
        class="mr-8px"
        @click="submit"
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
</template>
<script lang="ts" setup>
  
const state = reactive({
  apikey:'',
  host:'https://api.openai.com'
})
  
const insert = (key)=>{
  chrome.storage.sync.get(key, function(data) {
    if(data[key]){
      state[key] = data[key]
    }
  });
}
  
onMounted(()=>{
  ['apikey','host'].forEach(it=>{
    insert(it)
  })
})
    
const submit=()=>{
  chrome.storage.sync.set(state, function() {
    alert('success')
  });
}
  
</script>
<style lang="less" scoped>


</style>