import { createApp } from 'vue'
import transpanel from './components/transpanel.vue'
import 'uno.css'

const render = ()=>{

  const div = document.createElement('div');

  div.id = 'chrome-extension-ai-chat-2023-03-08-xl-popup'

  document.body.appendChild(div);

  createApp(transpanel,{
    isPopup:true,
    style:{
      position: 'relative'
    }
  }).mount(div)
}

(async ()=>{

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    debugger

    // 没有tab页面或者没有激活的Tab页面 直接创建聊天窗口
    if(tabs.length===0 || !tabs[0].active){
      render()
    }else{
      // 否则给当前页面的插件dom发送消息直接打开
      const tabId = tabs[0].id as number

      chrome.tabs.get(tabId, function(tab) {
        if (!tab.url || tab.url.includes('chrome://')) { // 判断是否有正常 url
          render()
        } else { // 如果有 url，给当前页面的插件 DOM 发送消息直接打开
          chrome.tabs.sendMessage(tabId as number, {message: "open aichat"},()=>{
            if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
              if(chrome.runtime.lastError.message.includes('Receiving end does not exist')){
                render()
              }

              return;
            }

            window.close()
          });
        }
      })

      //   chrome.tabs.sendMessage(tabId as number, {message: "open aichat"},()=>{
      //     if (chrome.runtime.lastError && chrome.runtime.lastError.message) {

      //       if(chrome.runtime.lastError.message.includes('Receiving end does not exist')){
      //         render()
      //       }

      //       return;
      //     }

    //     window.close()
    //   });
    }

  });

})()

export {}