import "./style.css"
import Graph from "./graph"
import ItemList from "./itemList"
import Menu from "./menu"

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
    <div id='graph'>
    </div>
  </div>
`
const itemList = new ItemList()

const recipeMenu = new Menu("recipe-menu")
recipeMenu.registerItems([
  {
    name: "craft",
    click: () => {
      console.log("crafting")
    },
  },
  {
    name: "refine",
    click: () => {
      console.log("refining")
    },
  },
])
recipeMenu.build()

const graph = new Graph()
graph.attachMenu(recipeMenu)
graph.update()
graph.render()
