
<template>
  <div
    v-if="!isProd"
    style="position: absolute;left:40%;top:40%;line-height: 1.5;"
  >
    <div>
      this is dev mode
    </div>
    <div>you can select this text</div>
    <div>Don't forget to disable chrome extensions AI-chat</div>
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
      @click="state.showtrans=true"
      @mouseleave="useRotate=false"
    >
    
    <transpanel
      v-if="state.showtrans"
      ref="panel"
      class="ai-chat-container-panel"
      :style="panelStyle"
      :select="selectString"
    />
  </div>
  <!-- <transpanel
    ref="panel"
    class="ai-chat-container-panel"
    :select="selectString"
  /> -->
</template>


<script setup lang="ts"> 

import { useMouse } from '@vueuse/core'
import transpanel from './components/transpanel.vue'
import { isProd } from './utils'

const iconimgUrl = ref('/icon.png')

if(chrome && chrome.runtime){
  iconimgUrl.value = chrome.runtime.getURL('/icon.png')
}

const selectString = ref('')

const useRotate = ref()

const icon = ref()

const panel = ref()

const state = reactive({
  showicon:false,
  showtrans:false
})


let timer;

const style = ref({
  left:'',
  top:''
})

const panelStyle = ref({
  left:'0',
  top:'0'
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

onMounted(()=>{

  const { x, y } = useMouse()

  const icon = 30

  const offset = 8

  const offseticon = offset+icon

  let left = 0

  let top = 0

  const panelWidth = 550

  const panelHeight = 480

  

  document.addEventListener('mouseup',()=>{ 
    setTimeout(()=>{
      const selectedText = document?.getSelection()?.toString();

      if(selectedText && selectedText.length > 0 && !state.showicon) {
        console.log(selectedText)

        state.showicon = true

        selectString.value = selectedText

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

        if(x.value+panelWidth>realInnerWidth){
          panelStyle.value.left=`-${panelWidth}px`
        }else{
          panelStyle.value.left = `-${offseticon}px`
        }

        if(y.value+panelHeight/2>realInnerHeight){
          panelStyle.value.top=`-${panelHeight}px`
        }else{
          panelStyle.value.top = `0`
        }

        style.value = {
          left:left+'px',
          top:top+'px'
        }

        setTimeout(()=>{
          document.addEventListener('mousedown',down,false)
        },0)
      }
    },0)
  })
})

const mouseover = ()=>{
  useRotate.value = true

  clearTimeout(timer)

  timer = setTimeout(_=>{
    if(useRotate.value && !state.showtrans){
      state.showtrans = true
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