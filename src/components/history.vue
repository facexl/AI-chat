<template>
  <div class="ai-chat-history absolute left-0 right-0 top-0 bottom-0">
    <div class="container">
      <div
        v-for="item in state.list"
        :key="item.id"
        class="item"
      >
        <span>{{ item.id }}</span>
        <span class="date">{{ item.date }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { storage } from '../utils'

const state = reactive({
  list:[]
})

onMounted(async ()=>{
  const chatRecord = (await storage.get('chatRecord'))['chatRecord'] || []

  state.list = chatRecord
})
    
</script>
  <style lang="less" scoped>
  .ai-chat-history{
      background-color: var(--ai-chat-bg);
      color:var(--ai-chat-font-color);
      z-index:2;
      box-sizing: border-box;
      padding-top:var(--toolbar-height);
      .container{
        height: 100%;
        overflow: scroll;
        .item{
            padding:10px;
            cursor: pointer;
            border-bottom: 1px solid #ccc;
            .date{
                color: #e96900;
                padding: 0.25rem 0.5rem;
                margin: 0;
                font-size: .85em;
                background-color: rgba(27,31,35,.05);
                border-radius: 3px;
            }
        }
      }
  }
  </style>