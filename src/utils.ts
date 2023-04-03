

import browserExStorage from 'browser-ex-storage'

export const isProd = import.meta.env.MODE === 'browser' ? false : import.meta.env.PROD


export const storage = isProd?browserExStorage('chrome-ex'):browserExStorage('browser')


const keyer = {
  current:0,
  prefix:String(Math.random()).substring(1,6)+`${+new Date()}`,
  key:''
}

Object.defineProperty(keyer,'key',{
  get(){
    this.current++;

    return `${this.prefix}k${this.current}`
  }
})

export  {
  keyer
}