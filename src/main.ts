import { createApp } from 'vue'
import 'uno.css'
import App from './App.vue'
import { isProd } from './utils'


const prod = ()=>{
  const el = document.createElement('div')

  const shadow = el.attachShadow({mode: 'open'})

  //   <link href="/dist/style.css" rel="stylesheet">
  shadow.innerHTML = `
        <link href="${chrome.runtime.getURL('style.css')}" rel="stylesheet">
        <div id="ai-chat"></div>
        `

  document.documentElement.insertBefore(el, null);

  createApp(App).mount((el.shadowRoot as any).getElementById('ai-chat'))
}

const dev = ()=>{
  const el = document.createElement('div')

  el.id = 'ai-chat'

  document.documentElement.insertBefore(el, null);

  createApp(App).mount(el)
}

// prod()

isProd?prod():dev()