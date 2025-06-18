import axios from 'axios'

export async function getItemDetailbyGameId(gameId, eventName){
    try{
        const resp = await axios(`https://api.nmsassistant.com/ItemInfo/GameId/${gameId}/en`)
        const data = resp.data
        const requiredItems = await getRequiredItems(data.requiredItems)

        const event = new CustomEvent(eventName,{
            detail:{
                node: [data, ...requiredItems],
            }
        })
        document.dispatchEvent(event)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return []
    }
}

export async function getItemDetailbyAppId(appId, eventName){
    try{
        const resp = await axios(`https://api.nmsassistant.com/ItemInfo/${appId}/en`)
        const data = resp.data
        const requiredItems = await getRequiredItems(data.requiredItems)

        const event = new CustomEvent(eventName,{
            detail:{
                node: [data, ...requiredItems],
            }
        })
        document.dispatchEvent(event)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return []
    }
}

async function getRequiredItems(requiredItems) {
    const requests = []
    for(const item of requiredItems){
        requests.push(axios(`https://api.nmsassistant.com/ItemInfo/${item.appId}/en`))
    }
    const resp = await Promise.all(requests)
    return resp?.map(r => r.data)
}