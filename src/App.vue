
<template>
  <div
    v-if="!isProd"
    style="position: absolute;left:40%;top:40%;line-height: 1.5;"
  >
    <div>浏览器模式，请划词召唤 AI-chat 小图标</div>
    <div>
      this is browser mode
    </div>
    <div>you can select this text</div>
    <div>if you install AI-chat chrome extension already</div>
    <div>don't forget to disable chrome extensions AI-chat</div>
  </div>

  <div
    v-show="state.showicon"
    ref="icon"
    class="ai-chat-container"
    :style="style"
  >
    <img
      class="icon"
      :src="iconimgUrl"
      alt="AI-chat图标"
      :class="{
        rotate:useRotate
      }"
      @mouseover="mouseover"
      @click="state.showtrans=true;state.isChat=false"
      @mouseleave="useRotate=false"
    >
  </div>
  <transpanel
    v-if="state.showtrans"
    ref="panel"
    class="ai-chat-container-panel"
    :style="panelStyle"
    :select="selectString"
    :is-chat="state.isChat"
    @close="state.showtrans=false;state.isChat=false"
  />
</template>


<script setup lang="ts"> 

import { useMouse } from '@vueuse/core'
import transpanel from './components/transpanel.vue'
import { isProd,storage } from './utils'
import config from './config'

const iconimgUrl = ref('/icon.png')

if(chrome && chrome.runtime){
  iconimgUrl.value = chrome.runtime.getURL('/icon.png')
}

const selectString = ref('')

const useRotate = ref()

const icon = ref()

const panel = ref()

const { x, y } = useMouse()

const state = reactive({
  showicon:false,
  showtrans:false,
  isChat:false
})


let timer;

const style = ref({
  left:'',
  top:''
})

const panelStyle = ref<{
    [key:string]:string|number
}>({
  left:0,
  top:0
})

const down = (event)=>{
  const target = state.showtrans?panel.value.$el:icon.value;

  // shadow dom 和 普通 dom 这里判断不一样
  const isClickInsideTargetDiv = isProd?event.composedPath().includes(target):target?.contains(event.target);

  if (!isClickInsideTargetDiv) {
    state.showicon = false

    state.showtrans = false

    document.removeEventListener('mousedown',down)
  }
}

const getScrollMsg = ()=>{
  return {
    height:document.documentElement.scrollTop || document.body.scrollTop,
    width:document.documentElement.scrollLeft || document.body.scrollLeft
  }
}

const checkSearchModel = async ()=>{
  const { searchGpt } = await storage.get('searchGpt')

  if(!searchGpt)return

  config.hosts.forEach(it=>{
    if(location.host===it.host && location.pathname===it.path){
      const res = location.href.match(it.reg)

      //   const res = location.href.match(/(?<=\?wd=)[^&]*/)

      if(res && res[0] && res[1]){
        panelStyle.value = {
          right:0,
          top:0
        }

        state.isChat = true

        state.showtrans = true

        selectString.value = decodeURIComponent(res[1])

        it.effect && it.effect(()=>{

          state.showtrans = false

          setTimeout(()=>{
            checkSearchModel()
          },100)
        })

      }
    }
  })
}

const setPosition = ()=>{
  
  const icon = 30

  const offset = 8

  const offseticon = offset+icon

  let left = 0

  let top = 0

  const panelWidth = 550

  const panelHeight = 480

  const scroll = getScrollMsg()

  const realInnerWidth = innerWidth+scroll.width

  const realInnerHeight = innerHeight+scroll.height

  if(x.value+offseticon>realInnerWidth){
    left = x.value-offseticon
  }else{
    left = x.value+offset
  }

  if(y.value+offseticon>realInnerHeight){
    top = y.value-offseticon
  }else{
    top = y.value+offset
  }


  const panelRes = {} as any
  
  if(x.value+panelWidth>realInnerWidth){
    panelRes.left=`${x.value-panelWidth}px`
  }else{
    panelRes.left = `${x.value-offseticon}px`
  }

  if(y.value+panelHeight/2>realInnerHeight){
    panelRes.top=`${y.value-panelHeight}px`
  }else{
    panelRes.top = y.value+'px'
  }

  panelStyle.value = panelRes
  

  style.value = {
    left:left+'px',
    top:top+'px'
  }
}

onMounted(()=>{
  // 搜索询问gpt
  checkSearchModel()

  document.addEventListener('mouseup',()=>{ 
    setTimeout(()=>{
      const selectedText = document?.getSelection()?.toString();

      if(selectedText && selectedText.length > 0 && !state.showicon && !state.showtrans) {
        console.log(selectedText)

        state.showicon = true

        selectString.value = selectedText

        setPosition()

        setTimeout(()=>{
          document.addEventListener('mousedown',down,false)
        },0)
      }
    },0)
  })

  if(!isProd){
    window.onresize = setPosition
  }
})

const mouseover = ()=>{
  useRotate.value = true

  clearTimeout(timer)

  timer = setTimeout(_=>{
    if(useRotate.value && !state.showtrans){
      state.showtrans = true

      state.isChat=false
    }
  },1000)
}

</script>
<style lang="less">

.ai-chat-container{
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  font-size: 14px;
  text-size-adjust: 100% !important; 
    position: absolute;
    z-index:2147483647;
    background-color: #fff;
    // user-select: none;
    cursor: pointer;
    .icon{
        width: 30px;
    }
    .rotate{
        animation: rotate 1s infinite linear;
    }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}


</style>