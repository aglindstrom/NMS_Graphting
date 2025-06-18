import axios from 'axios'

export async function refinerByInput(appId){
    const event = new CustomEvent('updateItems',{})
    try{
        const resp = await axios(`https://api.nmsassistant.com/ItemInfo/RefinerByInput/${appId}/en`)
        console.log(resp.data)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return [];
    }
}

export async function RefinerByOutput(appId){
    const event = new CustomEvent('updateItems',{})
    try{
        const resp = await axios(`https://api.nmsassistant.com/ItemInfo/RefinerByOutput/${appId}/en`)
        console.log(resp.data)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return [];
    }
}