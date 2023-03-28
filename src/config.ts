export default {
  host:'https://api.openai.com', // 默认host
  hosts:[ // 搜索时访问 gpt
    {
      host:'www.google.com',
      path:'/search',
      reg:/q=([^&]*)/
    },
    {
      host:'www.baidu.com',
      path:'/s',
      reg:/wd=([^&]*)/,
      init:false,
      effect(fn){
        if(this.init){
          return
        }

        this.init = true

        const input = <HTMLElement>document.getElementById('kw')

        const btn = <HTMLElement>document.getElementById('su')

        input.onkeydown = (e)=>{
          if(e.code==='Enter'){
            fn()
          }
        }

        btn.onclick = fn
      }
    },
    {
      host:'127.0.0.1:5173',
      path:'/',
      reg:/q=([^&]*)/
    },
    {
      host:'cn.bing.com',
      path:'/search',
      reg:/q=([^&]*)/
    }
  ]
}