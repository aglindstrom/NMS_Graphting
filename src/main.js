import "./style.css"
import GraphVis from "./graphVis"
import ItemList from "./itemList"
import Menu from "./menu"
import { RefinerByOutput } from "./requests/refiner"
import { CraftingByOutput } from "./requests/crafting"

document.querySelector("#app").innerHTML = `
  <div id='header'>
    <h1>
      No Man's Sky Graphting
    </h1>
  </div>
  <div id='recipe-menu'>
  </div>
  <div id='app-container'> 
    <div id='item-list'>
    </div>
    <div id='graph' class='grid-lines'>
    </div>
  </div>
`

const refiners = ["conTech13", "conTech14", "conTech15"]
const itemList = new ItemList()

const recipeMenu = new Menu("recipe-menu")
recipeMenu.registerItems([
  {
    name: "craft",
    click: CraftingByOutput,
  },
  {
    name: "refine",
    click: RefinerByOutput,
  },
])
recipeMenu.build()

const graph = new GraphVis()
graph.attachMenu(recipeMenu)
graph.update()
graph.render()
