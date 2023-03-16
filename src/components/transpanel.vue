<template>
  <div
    class="ai-chat-container-panel"
    :class="{
      'ai-chat-container-panel-dark':isDark
    }"
  >
    <div class="toolbar">
      <span class="title">AI-chat  powered by openai chatGpt</span>
      <div class="menus">
        <span @click="toogle">{{ isDark?'dark':'light' }}</span>
        <!-- <span>设置</span>
        <span>最大化</span>
        <span>关闭</span> -->
      </div>
    </div>
    <!-- <setinfo /> -->
    <div>
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
          <span
            v-show="index===msgs.length-2 && reqing"
            class="light-line"
          />
        </div>
      </div>
    
      <div class="user-input">
        <span class="error">{{ tipMsg }}</span>
        <a-textarea
          ref="textarea"
          v-model:value="input"
          class="user-input-textarea"
          :rows="4"
          placeholder="可以继续聊天哟"
          @keydown.enter="send"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import config from '../../config'

import { createParser } from 'eventsource-parser'


const props = defineProps({
  select:String
})

const input = ref('')

const showTip = ref(false)

const tipMsg = ref()

const textarea = ref()

const chatPanle = ref()

const reqing = ref(false)

const isDark = ref(false)



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

const toogle = ()=>{
  isDark.value = !isDark.value
}

const check = ()=>{
  import.meta.env.PROD?
    chrome.storage.sync.get(['apikey','host','msg','isDark'], function(data) {
      if(!data.apikey){
        tipMsg.value = '检测到未设置 apikey,请点击浏览器右上角插件图标进行设置,apikey 获取方式:https://platform.openai.com/account/api-keys'

        return
      }

      if(!data.host){
        tipMsg.value = '检测到未设置 host,请点击浏览器右上角插件图标进行设置'

        return
      }

      if(data.isDark){
        isDark.value = true
      }

      apikey = data.apikey

      host = data.host

      let pre_msg = props.select

      if(data.msg){
        pre_msg = data.msg+props.select
      }

      msgs.value.push({ role: 'user', content: pre_msg as string })

      req()
    }):(()=>{

      msgs.value.push({ role: 'user', content: `翻译成中文:`+props.select as string })

      apikey = config.apikey as string

      host = config.host as string
      
      req()
    })()
  
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
  msgs.value.push({
    role:'assistant',
    content:''
  })

  reqing.value = true

  try{
    const res = await fetch(`${host}/v1/chat/completions`, {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apikey}`,
      },
      body: JSON.stringify({
        stream: true,
        model: 'gpt-3.5-turbo',
        messages: msgs.value,
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
      })
    })

    if (res.status !== 200) {
      const { error } = await res.json()

      tipMsg.value = error.message

      return
    }

    const reader = (res.body as ReadableStream).getReader();

    const parser = createParser((event) => {
      if (event.type === 'event') {
        const d = event.data as any

        console.log(d)

        if(d==='[DONE]'){
          reqing.value = false

          return
        }

        const target = JSON.parse(d).choices[0]

        const { delta } = target

        if(delta.role){
          return
        }

        if(delta.content){
          const msg = msgs.value[msgs.value.length-1]

          msgs.value.splice(msgs.value.length-1,1,{
            role:msg.role,
            content:(msg.content+delta.content).trim()
          })
        }
      
      }
    })

    // 读取数据
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          reqing.value = false

          console.log('读取完成');

          return;
        }

        parser.feed(new TextDecoder('utf-8').decode(value))

        // 递归继续读取数据
        read();
      });
    }
  
    read();
  }catch(err){
    console.log(err)

    tipMsg.value = 'internet connect err'

    reqing.value = false
  }

  
}
</script>
<style lang="less">
.ai-chat-container-panel{
    --ai-chat-bg:#fff;
    --ai-chat-deep-bg:#f3f3f3;
    --ai-chat-font-color:#000;
}
.ai-chat-container-panel-dark{
    --ai-chat-bg:#1e1e20;
    --ai-chat-deep-bg:#101014;
    --ai-chat-font-color:#fff;
}
.ai-chat-container-panel{
    position: absolute;
    z-index:2147483647;
    left:40px;
    top:0;
    width:450px;
    height:380px;
    // user-select: none;
    transition: width .4s,height .4s,opacity .4s,top .4s cubic-bezier(.55,.82,.63,.95),left .4s cubic-bezier(.4,.9,.71,1.02);
    border-radius: 6px;
    box-shadow: rgb(0 0 0 / 80%) 0 4px 23px -6px;
    background-color: var(--ai-chat-deep-bg);
    transition: all .3s;
    .chat-panel{
        height:252px;
        overflow-y: scroll;
        scrollbar-width: none; /* Firefox 兼容性 */
        -ms-overflow-style: none; /* IE 兼容性 */
        .item{
            padding:8px;
            color:var(--ai-chat-font-color);
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
            background-color: var(--ai-chat-bg);
            .tip{
                color:red;
                font-weight: bold;
            }
        }
        .A{
            background-color: var(--ai-chat-deep-bg);
            .tip{
                color:blue;
                font-weight: bold;
            }
        }
    }
    .toolbar{
        display: flex;
        align-items: center;
        justify-content: space-between;
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
    .user-input-textarea{
        background-color: var(--ai-chat-bg);
    }
    
} 
.ai-chat-container-panel-dark .user-input-textarea{
    border: none;
}
::-webkit-scrollbar {
    width: 0;
    height: 0;
}
.light-line::after{
    content: ' ';
    animation: lightLine 1s infinite;
    font-weight: bold;
}

@keyframes lightLine {
    0%{
        content: "_";
    }
    50%{
        content: " ";
    }
    100%{
        content: "_";
    }
}
</style>