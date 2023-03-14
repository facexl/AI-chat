import { defineConfig } from 'vite'

import common from './vite.config.common'

import path  from 'path'

export default defineConfig(()=>{
  return Object.assign(common,{
    build: {
      target: 'modules',
      outDir: 'dist', //指定输出路径
      cssCodeSplit: false, /* 整个项目中的所有 CSS 将被提取到一个 CSS 文件中 */
      chunkSizeWarningLimit: 1500, /* chunk 大小警告的限制（以 kbs 为单位） */
      sourcemap: false, /* 构建后是否生成 source map 文件 */
      emptyOutDir: false, /* 默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录 */
      rollupOptions:{
        input:{
          popup:path.resolve(__dirname, 'popup.html'),
        },
        output:{
          chunkFileNames:`resource/[name].js`,
          assetFileNames:`resource/[name].[ext]`,
          entryFileNames:`resource/[name].js`,
        }
      }
    }
  })
})