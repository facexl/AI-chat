<template>
  <div class="ai-chat-history absolute left-0 right-0 top-0 bottom-0">
    <div class="container">
      <div
        v-for="(item,i) in state.list"
        :key="item.id"
        class="item flex"
        @click="$emit('chooseHistory',item)"
      >
        <div class="content">
          {{ item.list[0]?.content }}
        </div>
        <div class="date">
          更新时间:{{ item.update_time }}
        </div>
        <div
          class="del"
          @click.stop="del(i)"
        >
          X
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { storage } from '../utils'

defineEmits(['chooseHistory'])

const state = reactive<{
    list:ParseHistory[]
}>({
  list:[]
})

const del = async (index)=>{
  const chatRecord = (await storage.get('chatRecord'))['chatRecord']

  chatRecord.splice(index,1)

  await storage.set({
    chatRecord
  })

  state.list.splice(index,1)
}

onMounted(async ()=>{
  const chatRecord = (await storage.get('chatRecord'))['chatRecord'] || []

  chatRecord.forEach(it=>{
    it.list = JSON.parse(it.list)
  })

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
            font-size: 14px;
            flex-wrap: nowrap;
            white-space: nowrap;
            border-bottom: 1px solid var(--light-border-gray);
            .content{
                color:var(--ai-chat-font-color);
                padding:4px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .date{
                width:auto;
                color: #e96900;
                font-size: 12px;
                background-color: var(--history-gray);
                padding:4px 8px;
                border-radius: 3px;
            }
            .del{
                width:auto;
                color: #f50;
                font-size: 12px;
                padding:4px 8px;
                border-radius: 3px;
            }
        }
      }
  }
  </style>