import { defineConfig } from 'vite'

import common from './vite.config.common'

import path  from 'path'

export default defineConfig(()=>{
  return Object.assign(common,{
    build: {
      minify:'terser',
      terserOptions : {
        compress : {
          drop_console : true ,
          drop_debugger : true ,
        },
      }, 
      lib:{
        entry: path.resolve(__dirname, 'src/main.ts'),
        name: 'aichat',
        formats:['iife'],
        // the proper extensions will be added
        fileName: 'aichat',
      }
    }
  })
})