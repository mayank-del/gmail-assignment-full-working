let messageData=[
    {
        id: '18b9af13b47689c6',
        threadId: '18b9af13b47689c6',
        labelIds: [ 'CATEGORY_PROMOTIONS', 'UNREAD', 'INBOX' ],
        snippet: 'Ready for something new? We have your next selection of recommended courses. Each one was chosen based on your unique interests.'
    },
    {
        id: 'jhsfusrg67',
        threadId: 'kdjskfbjshc73',
        labelIds: [ 'READ', 'OUTBOX' ],
        snippet: 'Sab Janna hai bhadwe ko'
    }

]

let cleanedData=messageData.map(msg=>{
    let obj={
        id:msg.id,
        message:msg.snippet
    }
    return obj
})

console.log(cleanedData);