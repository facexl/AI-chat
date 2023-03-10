var link = document.createElement('link');
link.href = chrome.runtime.getURL('style.css');
link.rel = 'stylesheet';

document.documentElement.insertBefore(link, null);


