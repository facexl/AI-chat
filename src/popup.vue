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
        class="mt-16"
      />
      <a-input
        v-model:value="state.host"
        class="mt-16"
        addon-before="openai host"
        placeholder="please input host"
      />
      <a-input
        v-model:value="state.msg"
        addon-before="引导语"
        class="mt-16"
        placeholder="please input first message"
      />
      <p>引导语是划词后，跟chatGpt聊天的第一句话的句首，默认为'翻译成中文:'</p>
      <div
        style="display: flex;justify-content: center;"
        class="mt-16"
      >
        <a-button
          type="primary"
          @click="submit"
        >
          save
        </a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

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

      .mt-16{
        margin-top:16px;
      }
  }

  </style>