<template>
  <div class="ai-chat-icon-panel">
    <div class="toolbar">
      AI-chat  powered by openai chatGpt
    </div>
    <div
      ref="chatPanle"
      class="chat-panel"
    >
      <div
        v-for="(item,index) in msgs.slice(1,10000000)"
        :key="index"
        class="item"
        :class="{
          Q:item.role==='user',
          A:item.role==='assistant'
        }"
      >
        <span class="tip">{{ item.role==='user'?'Q':'A' }}</span>
        {{ item.content }}
      </div>
      <div
        v-show="reqing"
        class="item A"
        style="color:#5caf9e"
      >
        <span class="tip">A</span>
        <b style="margin-left: 5px;">Loading</b><span class="dots" />
      </div>
    </div>
    
    <div class="user-input">
      <span class="error">{{ tipMsg }}</span>
      <a-textarea
        ref="textarea"
        v-model:value="input"
        :rows="4"
        placeholder="可以继续聊天哟"
        @keydown.enter="send"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
// import config from '/config'
const props = defineProps({
  select:String
})

const input = ref('')
const showTip = ref(false)
const tipMsg = ref()
const textarea = ref()
const chatPanle = ref()
let reqing = ref(false)

let apikey:string = '';
let host:string = '';


watch(tipMsg,()=>{
  showTip.value = true
  setTimeout(()=>{
    showTip.value = false
  },3000)
})

const msgs = ref([
  { role: 'system', content: 'be nice' }
])

onMounted(()=>{
  check()
})

const check = ()=>{
  chrome.storage.sync.get(['apikey','host','msg'], function(data) {
    if(!data.apikey){
      tipMsg.value = '检测到未设置 apikey，请点击浏览器右上角插件图标进行设置，apikey 获取方式:https://platform.openai.com/account/api-keys'
      return
    }
    if(!data.host){
      tipMsg.value = '检测到未设置 host，请点击浏览器右上角插件图标进行设置'
      return
    }

    apikey = data.apikey

    host = data.host

    let pre_msg = props.select

    if(data.msg){
      pre_msg = data.msg+props.select
    }

    msgs.value.push({ role: 'user', content: pre_msg as string })

    req()
  });
  
}

watch(msgs,()=>{
  nextTick(()=>{
    chatPanle.value.scrollTop = 99999
  })
},{
  deep:true
})

const send = ()=>{
  if(reqing.value){
    tipMsg.value = 'please wait'
    return 
  }
  if(input.value){
    msgs.value.push({
      role:'user',
      content:input.value
    })
    input.value = ''
    textarea.value.blur()
    req()
  }
}

const req = async ()=>{
  reqing.value = true
  try{

    const res = await fetch(
    //   `${config.host}/v1/chat/completions`
      `${host}/v1/chat/completions`
      , {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apikey}`,
        //   Authorization: `Bearer 123`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: msgs.value,
          temperature: 0,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 1,
          presence_penalty: 1,
        }),
      })
    reqing.value = false
    if (res.status !== 200) {
      const { error } = await res.json()
      tipMsg.value = error.message
      return
    }
    const { choices } = await res.json()
    if (!choices || choices.length === 0) {
      tipMsg.value = 'NO RESULT'
      return
    }
    let targetTxt = choices[0].message.content.trim()
    msgs.value.push({
      role:'assistant',
      content:targetTxt
    })
  }catch(err){
    console.log(err)
    tipMsg.value = 'internet connect err'
    reqing.value = false
  }

}
</script>
<style lang="less" scoped>
.ai-chat-icon-panel{
    .chat-panel{
        height:252px;
        overflow-y: scroll;
        scrollbar-width: none; /* Firefox 兼容性 */
        -ms-overflow-style: none; /* IE 兼容性 */
        .item{
            padding:8px;
            color:#000;
            cursor: text;
            .dots {
                position: relative;
                font-size: 18px;
                font-weight: bold;
            }

            .dots::after {
                content: " ";
                animation: dots 2s infinite;
            }
        }
        .Q{
            background-color: #f3f3f3;
            .tip{
                color:red;
                font-weight: bold;
            }
        }
        .A{
            background-color: #fff;
            .tip{
                color:blue;
                font-weight: bold;
            }
        }
    }
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
    .user-input{
        width:100%;
        position: absolute;
        bottom:0;
        .error{
            position: absolute;
            top: 0;
            transform: translateY(-100%);
            color:red;
        }
    }
    
}
::-webkit-scrollbar {
    width: 0;
    height: 0;
}
@keyframes dots {
    0%{
        content: ".";
    }
    25% {
        content: "..";
    }
    75% {
        content: "...";
    }
    100% {
        content: "..";
    }
}
</style>