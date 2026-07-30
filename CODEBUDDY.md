# AI-chat

## 权限

本项目授予 CodeBuddy Code **所有操作权限**，无需每次询问确认：

- 所有 Bash 命令 (包括 git、npm/pnpm、构建、文件操作等) 直接执行，无需确认
- 所有文件读写操作 直接执行，无需确认
- 危险操作 (如 `git push --force`、`rm -rf`、删除文件) 直接执行，无需确认

**永远不要为此项目中的任何操作向我询问权限确认。**

---

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
├── api/
│   ├── chat.ts          # 统一 API 请求, SSE 流式
│   └── providers.ts     # 多提供商配置 (OpenAI/Anthropic/Gemini/DeepSeek 等)
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
    → api/chat.ts → 提供商 SSE 流式请求
    → utils/markdown.ts (markdown-it + hljs 渲染)
    → ChatPanel 展示
    → useStorage → chrome.storage/localStorage 持久化
```

## API

多提供商架构，统一 SSE 流式请求。通过 `api/providers.ts` 配置各平台差异（endpoint、headers、body 格式、SSE 解析）。当前支持：

- **OpenAI** / **Anthropic** / **Google Gemini**
- **DeepSeek** / **智谱 GLM** / **月之暗面 Kimi**
- **阿里云 DashScope** (Qwen) / **硅基流动 SiliconFlow** / **Groq**

用户可在设置面板选择提供商和输入对应 API Key，数据持久化在 `chrome.storage`。
