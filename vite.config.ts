import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import path from 'path'

const MODE = process.env.npm_lifecycle_event?.includes(':content') ? 'content' :
              process.env.npm_lifecycle_event?.includes(':background') ? 'background' : 'popup'

export default defineConfig(({ mode }) => {
  const isContent = mode === 'content'
  const isBackground = mode === 'background'

  if (isBackground) {
    return {
      build: {
        minify: 'esbuild',
        esbuild: {
          drop: ['console', 'debugger'],
        },
        lib: {
          entry: path.resolve(__dirname, 'src/background.ts'),
          name: 'background',
          formats: ['iife'],
          fileName: () => 'background.js',
        },
        outDir: 'dist',
        emptyOutDir: false,
      },
    }
  }

  return {
    define: isContent ? {
      'process.env.NODE_ENV': JSON.stringify('production'),
    } : {},
    plugins: [
      vue(),
      UnoCSS(),
      AutoImport({
        imports: ['vue'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        dts: 'src/components.d.ts',
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    base: '/',
    build: isContent ? {
      minify: 'esbuild',
      esbuild: {
        drop: ['debugger'],
        define: {
          'process.env.NODE_ENV': '"production"',
        },
      },
      lib: {
        entry: path.resolve(__dirname, 'src/main.ts'),
        name: 'aichat',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
      outDir: 'dist',
      emptyOutDir: false,
    } : {
      minify: 'esbuild',
      target: 'es2015',
      outDir: 'dist',
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1500,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, 'popup.html'),
        },
        output: {
          chunkFileNames: 'resource/[name].js',
          assetFileNames: 'resource/[name].[ext]',
          entryFileNames: 'resource/[name].js',
        },
      },
    },
  }
})
