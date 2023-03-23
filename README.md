## AI-chat 是一款 openai chatGpt api 驱动的划词聊天、划词翻译 chrome 插件，支持预设引导语，使用 stream 模式请求 openai，快速响应

比如：引导语设置为:`翻译成中文：`,这时候 `AI-chat` 就化身为划词翻译了！

### 功能简介:

### 1.划词翻译:

<img src="/docAssets/1.png" alt="示例图片" width="400">

### 2.预设引导语:

![示例图片](/docAssets/2.png)

### 3.继续聊天:

![示例图片](/docAssets/3.png)  

### 4.内置markdown解析和语法高亮，支持渲染代码块

![示例图片](/docAssets/4.png) 

### 5.暗夜模式以及全屏模式  

![示例图片](/docAssets/5.png) 

### 6.点击右上角插件图标快速聊天模式  

![示例图片](/docAssets/6.png) 

## 使用方式:

由于暂时还没有上架 chrome 应用商店，只能通过下载当前项目，chrome 地址栏输入 `chrome://extensions/`，打开开发者模式，选择`加载已解压的扩展程序`然后选择本项目的 `dist`目录。

## 持续开发中的工作  

- [x] 使用 shodow dom 避免 css 污染
- [x] popup.html ui 优化一下  
- [ ] 翻译面板增加固钉、拖拽  
- [x] 增加放大全屏  
- [x] 面板位置 不要跑出屏幕  
- [x] 切换到 stream 请求  
- [x] 保留历史引导词条    
- [x] dark mode
- [x] tool bar 增加 set 按钮 
- [x] 右上角点击增加自助翻译  
- [x] markdownit 和 highlight.js 渲染回答  并且实现 code 代码区明暗主题  
- [ ] 保留历史对话  
- [ ] 窗口处点击最大化 直接打开新tab  