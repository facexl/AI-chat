

export const isProd = import.meta.env.PROD


interface S{
    get<T extends string>(key:T):Promise<{
        [key in T]:any
    }>,
    get<T extends string[]>(keys:T):Promise<{
        [key in T[number]]:any
    }>,
    set:(obj:{[key:string]:any})=>Promise<undefined>,
    remove:(key:string)=>Promise<undefined>,
    clear:()=>Promise<undefined>
}

// storage.get<['a']>(['a']).then(res=>{
//   res.
// })

export const storage = (isProd?{
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        resolve(result as any);
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
      const k = (Array.isArray(keys)?keys:[keys])

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
}) as S

const getJsonData = (d)=>{
  try{
    return JSON.parse(d)
  }catch(err){
    
  }

  return d
}