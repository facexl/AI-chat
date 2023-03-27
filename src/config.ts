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
      reg:/wd=([^&]*)/
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