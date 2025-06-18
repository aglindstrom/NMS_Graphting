import axios from 'axios'

export async function getItemList(name){
    
    try{
        const resp = await axios('https://api.nmsassistant.com/ItemInfo/GameId')
        const event = new CustomEvent(name,{
            detail: {
                gameId: resp.data,
                link: null
            },
        })
        document.dispatchEvent(event)
    }catch(error){
        console.error("getItemsList: ", error)
    }finally{
        return [];
    }
}



