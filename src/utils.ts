

export const isProd = import.meta.env.PROD

export const storage = isProd?{
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        resolve(result);
      });
    });
  },
  set(obj) {
    console.log('chrome set')
  
    return new Promise((resolve) => {
      chrome.storage.sync.set(obj, () => {
        console.log('chrome set success',obj)
  
        resolve(undefined);
      });
    });
  },
  remove(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(key, () => {
        resolve(undefined);
      });
    });
  },
  clear() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve(undefined);
      });
    });
  },
}:{
  get(keys){
    return new Promise(resolve=>{
      const k = Array.isArray(keys)?keys:[keys]

      resolve(k.reduce((a,b)=>{
        a[b] = getJsonData(localStorage.getItem(b))

        return a
      },{}))
    })
  },
  set(obj){
    return new Promise((resolve) => {

      Object.keys(obj).forEach(it=>{
        localStorage.setItem(
          it,
          typeof obj[it] === 'string'?obj[it]:JSON.stringify(obj[it])
        )
      })

      resolve(undefined)
    });
  },
  remove(key) {
    return new Promise((resolve) => {
      localStorage.removeItem(key)

      resolve(undefined)
    });
  },
  clear() {
    return new Promise((resolve) => {
      localStorage.clear()

      resolve(undefined);
    });
  },
}

const getJsonData = (d)=>{
  try{
    return JSON.parse(d)
  }catch(err){
    
  }

  return d
}