import { createApp } from 'vue'

import App from './popup.vue'

import 'uno.css'

const div = document.createElement('div');

div.id = 'chrome-extension-ai-chat-2023-03-08-xl-popup'

document.body.appendChild(div);

createApp(App).mount(div)
