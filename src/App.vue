
<template>
  <!-- <div>hello my name is xl</div>
  <div>are you ok</div>
  <div>are you kidding me</div> -->
  <div
    v-show="showicon"
    ref="icon"
    class="ai-chat-icon"
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
      class="ai-chat-icon-panel"
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
let timer;
const style = ref({
  left:'',
  top:''
})

const down = (event)=>{
  const target = showtrans.value?panel.value.$el:icon.value;
  const isClickInsideTargetDiv = target?.contains(event.target);
  if (!isClickInsideTargetDiv) {
    showicon.value = false
    showtrans.value = false
    document.body.removeEventListener('mousedown',down)
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
          document.body.addEventListener('mousedown',down,false)
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
<style lang="less" scoped>
.ai-chat-icon{
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
    position: absolute;
    z-index:2147483647;
    background-color: #fff;
    // user-select: none;
    cursor: pointer;
    .icon{
        width: 30px;
        // &:hover{
        //     animation: rotate 1s infinite linear;
        // }
    }
    .rotate{
        animation: rotate 1s infinite linear;
    }
}
.ai-chat-icon-panel{
    position: absolute;
    z-index:2147483647;
    left:40px;
    top:0;
    width:450px;
    height:380px;
    background-color: #fff;
    // user-select: none;
    transition: width .4s,height .4s,opacity .4s,top .4s cubic-bezier(.55,.82,.63,.95),left .4s cubic-bezier(.4,.9,.71,1.02);
    border-radius: 6px;
    background-color: #fff;
    box-shadow: rgb(0 0 0 / 80%) 0 4px 23px -6px;
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