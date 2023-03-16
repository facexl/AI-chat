import { defineConfig,loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'

import Components from 'unplugin-vue-components/vite'

import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

import UnoCSS from 'unocss/vite'

import path  from 'path'

export default {
  plugins: [
    vue(),
    UnoCSS({ /* options */ }),
    AutoImport({
      imports: ['vue'],
    }),
    Components({ 
      dts: true,
      resolvers: [
        AntDesignVueResolver(),
      ],
    })
  ],
  optimizeDeps: {
    include: [
      'ant-design-vue',
    ],
  },
  base:'/',
  resolve:{
    alias:{
      '@': path.resolve(__dirname,'src'),
      'root':path.resolve(__dirname),
    },
    extensions:['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}
