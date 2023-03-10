<template>
  <div class="ai-chat-icon-panel">
    <div class="toolbar">
      AI-chat  powered by openai chatGpt
    </div>
    <div>
      <a-input
        v-model:value="state.apikey"
        addon-before="openai apikey"
        placeholder="please input openai apikey"
      />
      <a-input
        v-model:value="state.host"
        addon-before="openai host"
        placeholder="please input host"
      />
      <a-input
        v-model:value="state.msg"
        addon-before="target language"
        placeholder="please input first message"
      />
      <a-button
        type="primary"
        @click="submit"
      >
        sure
      </a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>

// chrome.storage.sync.set({key1: value1, key2: value2, ...}, function() {
//   console.log('Value is set');
// });

const state = reactive({
  apikey:'',
  host:'https://api.openai.com',
  msg:'翻译成中文:'
})

const insert = (key)=>{
  chrome.storage.sync.get(key, function(data) {
    if(data[key]){
      state[key] = data[key]
    }
  });
}

onMounted(()=>{
  ['apikey','host','msg'].forEach(it=>{
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
  .ai-chat-icon-panel{
    width:450px;
    height:380px;
    background-color: #fff;
    // user-select: none;
    transition: width .4s,height .4s,opacity .4s,top .4s cubic-bezier(.55,.82,.63,.95),left .4s cubic-bezier(.4,.9,.71,1.02);
    border-radius: 6px;
    background-color: #fff;
    box-shadow: rgb(0 0 0 / 80%) 0 4px 23px -6px;
      .toolbar{
          display: flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          padding: 0 3px;
          background-color: #5caf9e;
          font-weight: bold;
          color:#fff;
      }

      
  }

  </style>