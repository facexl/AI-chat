
<template>
  <div
    v-if="!isProd"
    style="position: absolute;left:40%;top:40%;line-height: 1.5;"
  >
    <div>
      this is dev mode
    </div>
    <div>you can select this text</div>
    <div>Don't forget to disable chrome extensions</div>
  </div>

  <div
    v-show="showicon"
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
      @click="showtrans=true"
      @mouseleave="useRotate=false"
    >
    <transpanel
      v-if="showtrans"
      ref="panel"
      class="ai-chat-container-panel"
      :select="selectString"
    />
  </div>
</template>


<script setup lang="ts"> 

import { useMouse } from '@vueuse/core'

import transpanel from './components/transpanel.vue'

const iconimgUrl = ref('/icon.png')

if(chrome && chrome.runtime){
  iconimgUrl.value = chrome.runtime.getURL('/icon.png')
}

const showicon = ref(false)

const showtrans = ref(false)

const selectString = ref('')

const useRotate = ref()

const icon = ref()

const panel = ref()


const isProd = import.meta.env.PROD

let timer;

const style = ref({
  left:'',
  top:''
})

const down = (event)=>{
  const target = showtrans.value?panel.value.$el:icon.value;

  // shadow dom 和 普通 dom 这里判断不一样
  const isClickInsideTargetDiv = import.meta.env.PROD?event.composedPath().includes(target):target?.contains(event.target);

  if (!isClickInsideTargetDiv) {
    showicon.value = false

    showtrans.value = false

    document.removeEventListener('mousedown',down)
  }
}

onMounted(()=>{

  const { x, y } = useMouse()

  document.addEventListener('mouseup',()=>{ 
    setTimeout(()=>{
      const selectedText = document?.getSelection()?.toString();

      if(selectedText && selectedText.length > 0 && !showicon.value) {
        console.log(selectedText)

        showicon.value = true

        selectString.value = selectedText

        style.value = {
          left:x.value+'px',
          top:y.value+'px'
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
    if(useRotate.value && !showtrans.value){
      showtrans.value = true
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