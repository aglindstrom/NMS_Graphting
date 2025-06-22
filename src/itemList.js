import { getItemDetailbyGameId } from "./requests/itemDetail";
import { getItemList } from "./requests/itemList";

export default function ItemList() {
  const context = document.querySelector("#item-list");
  const eventName = "updateItemList";
  const gameId = { data: ["loading"] };
  let root = null;

  document.addEventListener(eventName, (event) => {
    gameId.data = event.detail.gameId;
    gameId.data.map((id) => {
      const div = document.createElement("div");
      div.classList.add("item");
      div.innerText = id;
      div.addEventListener("click", (e) => {
        if (root !== String(id)) {
          root = String(id);
          getItemDetailbyGameId(id, "updateGraph");
        }
      });
      context.appendChild(div);
    });
  });

  getItemList(eventName);
}
