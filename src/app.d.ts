type MsgItem = {
    role:string,
    content:string,
    tag?:string,
    marked?:string
}

interface HistoryItem {
    id:string,
    // list:MsgItem[],
    list:string,
    update_time:string
}

interface ParseHistory extends HistoryItem{
    list:MsgItem[],
}
