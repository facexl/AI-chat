type MsgItem = {
    role:string,
    content:string,
    tag?:string,
    marked?:string
}

type HistoryItem = {
    id:string,
    list:MsgItem[],
    update_time:string
}