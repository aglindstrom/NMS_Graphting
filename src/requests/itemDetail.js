import axios from "axios"

export async function getItemDetailbyGameId(gameId, eventName) {
  try {
    const resp = await axios(
      `https://api.nmsassistant.com/ItemInfo/GameId/${gameId}/en`
    )
    const data = resp.data

    const event = new CustomEvent(eventName, {
      detail: {
        node: [data],
        graphReset: true,
      },
    })
    document.dispatchEvent(event)
  } catch (error) {
    console.error("getItemsList: ", error)
  } finally {
    return []
  }
}

export async function getItemDetailbyAppId(appId, eventName) {
  try {
    const resp = await axios(
      `https://api.nmsassistant.com/ItemInfo/${appId}/en`
    )
    const data = resp.data

    const event = new CustomEvent(eventName, {
      detail: {
        node: [data],
      },
    })
    document.dispatchEvent(event)
  } catch (error) {
    console.error("getItemsList: ", error)
  } finally {
    return []
  }
}
