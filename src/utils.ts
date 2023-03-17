export const storage = {
  get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },
  set(obj) {
    return new Promise((resolve) => {
      chrome.storage.local.set(obj, () => {
        resolve(undefined);
      });
    });
  },
  remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve(undefined);
      });
    });
  },
  clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve(undefined);
      });
    });
  },
};

export const isProd = import.meta.env.PROD