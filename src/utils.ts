

import browserExStorage from 'browser-ex-storage'

export const isProd = import.meta.env.PROD

export const storage = isProd?browserExStorage('chrome-ex'):browserExStorage('browser')
