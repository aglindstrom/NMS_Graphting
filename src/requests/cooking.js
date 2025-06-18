import axios from 'axios'

export async function cookingByInput(appId){
    const event = new CustomEvent('updateItems',{})
    try{
        const resp = await axios(`https://api.nmsassistant.com/ItemInfo/CookingByInput/${appId}/en`)
        console.log(resp.data)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return [];
    }
}

export async function cookingByOutput(appId){
    const event = new CustomEvent('updateItems',{})
    try{
        const resp = await axios(`https://api.nmsassistant.com/ItemInfo/CookingByOutput/${appId}/en`)
        console.log(resp.data)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return [];
    }
}