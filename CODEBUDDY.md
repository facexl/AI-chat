# AI-chat

Chrome Extension (Manifest V3) built with Vue 3 + Vite + TypeScript. 划词聊天/翻译插件，基于 DashScope qwen3.7-plus API。

## 开发

```bash
pnpm dev          # 开发模式 (content script)
pnpm build        # 构建 (content + popup)
pnpm typecheck    # 类型检查
```

## 构建产物

```
dist/
├── content.js       # 内容脚本 (IIFE, 注入网页)
├── popup.html       # 插件弹窗入口
├── manifest.json    # Chrome 扩展配置
├── style.css        # content script 样式
├── icon.png
└── resource/
    ├── popup.js     # popup 页面 JS
    └── style.css    # popup 页面样式
```

## 架构

Vite 通过 `--mode` 切换两种构建：

| mode | 入口 | 格式 | 说明 |
|------|------|------|------|
| `content` | `src/main.ts` | IIFE | 注入到网页的内容脚本 |
| `popup` | `popup.html` | HTML | 点击插件图标弹出的面板 |

Content script 使用 Shadow DOM 隔离样式。Popup 直接渲染在弹窗页面中。

## src 结构

```
src/
├── api/chat.ts            # DashScope API, SSE 流式请求
├── composables/
│   ├── useChat.ts         # 聊天状态、消息、请求
│   ├── useStorage.ts      # chrome.storage/localStorage 封装
│   └── useTheme.ts        # 暗色/亮色切换
├── components/
│   ├── ChatPanel.vue      # 聊天面板 (消息/输入/工具栏)
│   ├── FloatingIcon.vue   # 划词后出现的浮动图标
│   ├── HistoryList.vue    # 历史记录列表
│   └── Settings.vue       # 设置面板 (API Key/Host)
├── utils/
│   ├── markdown.ts        # markdown-it + highlight.js 配置
│   └── storage.ts         # 存储工具 + keyer
├── types/index.ts         # 类型定义
├── config.ts              # 搜索集成配置
├── App.vue                # content script 主组件
├── main.ts                # content script 入口
└── popup.ts               # popup 入口
```

## 数据流

```
用户选择文本 → App.vue (mouseup 检测)
    → FloatingIcon 显示
    → ChatPanel 打开
    → api/chat.ts → DashScope SSE 流式请求
    → utils/markdown.ts (markdown-it + hljs 渲染)
    → ChatPanel 展示
    → useStorage → chrome.storage/localStorage 持久化
```

## API

DashScope 原生格式。模型 `qwen3.7-plus`。流式 SSE，Header 带 `X-DashScope-SSE: enable`。

## 搜索集成

在 Google / Baidu / Bing 搜索时，如果开启了 `searchGpt` 开关，会自动弹出 ChatPanel 用搜索词询问 AI。配置在 `src/config.ts`。
