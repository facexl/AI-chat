

import browserExStorage from 'browser-ex-storage'

export const isProd = import.meta.env.MODE === 'browser' ? false : import.meta.env.PROD


export const storage = isProd?browserExStorage('chrome-ex'):browserExStorage('browser')
