export default {
  host: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  hosts: [
    {
      host: 'www.google.com',
      path: '/search',
      reg: /q=([^&]*)/,
    },
    {
      host: 'www.baidu.com',
      path: '/s',
      reg: /wd=([^&]*)/,
      init: false,
      effect(this: { init: boolean }, fn: () => void) {
        if (this.init) return
        this.init = true
        const input = document.getElementById('kw') as HTMLInputElement | null
        const btn = document.getElementById('su') as HTMLElement | null
        if (input) {
          input.onkeydown = (e) => {
            if (e.code === 'Enter') fn()
          }
        }
        if (btn) {
          btn.onclick = fn
        }
      },
    },
    {
      host: 'cn.bing.com',
      path: '/search',
      reg: /q=([^&]*)/,
    },
  ],
}
