import "./style.css";
import Graph from "./graph";
import ItemList from "./itemList";

document.querySelector("#app").innerHTML = `
  <div id='header'>
    <h1>
      No Man's Sky Graphting
    </h1>
  </div>
  <div id='app-container'> 
    <div id='item-list'>
    </div>
    <div id='graph'>
    </div>
  </div>

`;
const itemList = new ItemList();
const graph = new Graph();
graph.update();
graph.render();
