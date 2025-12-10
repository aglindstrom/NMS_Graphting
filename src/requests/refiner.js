import axios from "axios"

export async function refinerByInput(node) {
  try {
    console.log("Refining[I]")
    const resp = await axios(
      `https://api.nmsassistant.com/ItemInfo/RefinerByInput/${node.appId}/en`
    )
    const data = resp.data

    const event = new CustomEvent("updateItems", {
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

export async function RefinerByOutput(node) {
  const event = new CustomEvent("updateItems", {})
  try {
    console.log("Refining[O]")

    const recipes = await axios(
      `https://api.nmsassistant.com/ItemInfo/RefinerByOutut/${node.appId}/en`
    )

    const event = new CustomEvent("updateGraph", {
      detail: {
        node: [node, ...recipes.data],
        isRefine: true,
      },
    })

    document.dispatchEvent(event)
  } catch (error) {
    console.error("getItemsList: ", error)
  } finally {
    return []
  }
}
