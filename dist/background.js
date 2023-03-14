
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ai-chat-menu-id-xlcool",
    title: "AI chat 立即聊天",
    contexts: ["all"]
  });
});
    
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    
  console.log('trigger tab')
    
  if (info.menuItemId == "ai-chat-menu-id-xlcool") {
    console.log('ai-chat-menu-id clicked!',info,tab)
  }
});