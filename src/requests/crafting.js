import axios from "axios"

export async function CraftingByOutput(node) {
  try {
    const requests = []
    for (const item of node.requiredItems) {
      requests.push(
        axios(`https://api.nmsassistant.com/ItemInfo/${item.appId}/en`)
      )
    }

    const resp = await Promise.all(requests)
    const event = new CustomEvent("updateGraph", {
      detail: {
        node: [node, ...resp.map((item) => item.data)],
      },
    })

    document.dispatchEvent(event)
  } catch (error) {
    console.error(error)
  } finally {
    return []
  }
}
