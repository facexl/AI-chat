export const storage = {
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
};

export const isProd = import.meta.env.PROD