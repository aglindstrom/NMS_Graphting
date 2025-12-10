import * as d3 from "d3"

export default function GraphVis(nodes = [], links = []) {
  const graph = {
    width: document.querySelector("#graph").scrollWidth,
    height: document.querySelector("#graph").scrollHeight,
    names: { data: null },
    links: { data: links },
    nodes: { data: nodes },
    bars: { data: null },
    hovered: null,
    depth: 2,
    hasMenu: false,
  }

  setUp()
  graph.link = graph.svg.append("g").selectAll(".link")
  graph.craftback = graph.svg.append("g").selectAll(".c-back")
  graph.craft = graph.svg.append("g").selectAll(".c-node")
  graph.refineback = graph.svg.append("g").selectAll(".r-back")
  graph.refine = graph.svg.append("g").selectAll(".r-node")

  document.addEventListener("updateGraph", (event) => {
    if (event.detail.graphReset) resetGraph()
    if (event.detail.isRefine) {
      console.log(event.detail)
      event.detail.node.slice(1).forEach((item) => {
        item.isRefine = true
        item.colour = "#fff"
      })
    }
    const index = graph.names.data?.indexOf(event.detail.node[0].name) ?? -1 // get the index of the first event node (from crafting it is the called node)
    const sourceId = graph.nodes.data[index]?.id ?? event.detail.node[0].appId // get the id of the first node or the appid if the id doesn't exist
    const indexDepth = graph.nodes.data[index]?.id.split(":").length + 2 ?? 2 // get the depth of the index from the id

    graph.depth = indexDepth > graph.depth ? indexDepth : graph.depth // update the overall graph depth

    event.detail.node.forEach((item) => {
      item.id = item.id ?? `${sourceId}:${item.appId}`
      item.open = false
    })

    if (sourceId === event.detail.node[0].appId) {
      event.detail.node[0].id = event.detail.node[0].appId
      event.detail.node[0].open = true
    }

    if (index === -1) {
      console.log("new graph")
      graph.depth = event.detail.node.length === 1 ? 2 : 3
      graph.names.data = event.detail.node.map((d) => d.name) ?? []
      graph.nodes.data = event.detail.node ?? []
      graph.links.data =
        [
          ...event.detail.node
            .slice(1)
            .map((item) => ({ source: sourceId, target: item.id })),
        ] ?? []
    } else {
      console.log("adding to graph")
      console.log(graph.names.data)
      graph.names.data.splice(
        index,
        0,
        ...event.detail.node.slice(1).map((d) => d.name)
      )
      graph.nodes.data.splice(index, 0, ...event.detail.node.slice(1))
      graph.links.data =
        [
          ...graph.links.data,
          ...event.detail.node
            .slice(1)
            .map((item) => ({ source: sourceId, target: item.id })),
        ] ?? []
    }

    console.log(graph.nodes.data.map((n) => n.id))
    const xStep = graph.width / graph.depth
    graph.nodes.data.forEach((item) => {
      item.fx = xStep * item.id.split(":").length - graph.width / 2
      item.pull = item.id.split(":").length
    })

    update()
    render()
  })

  function setUp() {
    graph.svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", graph.width)
      .attr("height", graph.height)
      .attr("viewBox", [
        -graph.width / 2,
        -graph.height / 2,
        graph.width,
        graph.height,
      ])
      .attr("style", "max-width: 100%; height: auto;")

    graph.simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force("y", d3.forceY())
      .force("x", d3.forceX())
  }

  function resetGraph() {
    console.log("resetting graph")
    graph.names.data = null
    graph.links.data = []
    graph.nodes.data = []
  }

  function render() {
    graph.simulation.nodes(graph.nodes.data).on("tick", () => {
      graph.link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      graph.craft.attr("x", (d) => d.x - 25).attr("y", (d) => d.y - 25)
      graph.refine.attr("x", (d) => d.x - 4.5).attr("y", (d) => d.y + 5)
      graph.craftback.attr("x", (d) => d.x - 25).attr("y", (d) => d.y - 25)
      graph.refineback.attr("x", (d) => d.x - 10).attr("y", (d) => d.y - 10)
    })

    graph.simulation.force("charge").strength((d) => -2000 / d.pull)
    graph.simulation.force("link").links(graph.links.data).strength(0.05)
    graph.simulation.alpha(1).restart()
  }
  graph.render = render

  function update() {
    if (!graph.nodes) return
    graph.nodes.data.map((d) => (d.t = 0))

    graph.link = graph.link.data(
      graph.links.data,
      (d) => d.source.id ?? d.source + "-" + d.target.id ?? d.target
    )
    graph.link.exit().remove()
    graph.link = graph.link
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .merge(graph.link)

    graph.craftback = graph.craftback.data(
      graph.nodes.data.filter((node) => !node.isRefine),
      (d) => d.id
    )
    graph.craftback.exit().remove()
    graph.craftback = graph.craftback
      .enter()
      .append("rect")
      .attr("class", "back")
      .attr("width", "50")
      .attr("height", "50")
      .attr("fill", (d) => `#${d.colour}` ?? "#000")
      .attr("stroke-width", "2px")
      .attr("stroke", "#fff")
      .merge(graph.craftback)

    graph.refineback = graph.refineback.data(
      graph.nodes.data.filter((node) => node.isRefine),
      (d) => d.id
    )
    graph.refineback.exit().remove()
    graph.refineback = graph.refineback
      .enter()
      .append("rect")
      .attr("class", "back")
      .attr("width", "20")
      .attr("height", "20")
      .attr("fill", "#fff")
      .attr("stroke-width", "2px")
      .attr("stroke", "#fff")
      .attr("rx", "10px")
      .attr("ry", "10px")
      .merge(graph.refineback)

    graph.craft = graph.craft.data(
      graph.nodes.data.filter((node) => !node.isRefine),
      (d) => d.id
    )
    graph.craft.exit().remove()
    graph.craft = graph.craft
      .enter()
      .append("image")
      .attr("class", "c-node")
      .attr("href", (d) => d.iconUrl)
      .attr("width", "50px")
      .attr("height", "50px")
      .on("click", nodeClick)
      .merge(graph.craft)

    graph.craft.append("title").text((d) => d.name ?? d.id)

    graph.craft.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )

    graph.refine = graph.refine.data(
      graph.nodes.data.filter((node) => node.isRefine),
      (d) => d.id
    )
    graph.refine.exit().remove()
    graph.refine = graph.refine
      .enter()
      .append("text")
      .attr("class", "r-node")
      .attr("width", "50px")
      .attr("height", "50px")
      .text((d) => d.inputs.length)
      .on("click", nodeClick)
      .merge(graph.refine)

    graph.refine
      .append("title")
      .text(
        (d) =>
          d.inputs
            .map((input) => input.name ?? input.id ?? input.appId)
            .join(", ") ?? d.id
      )

    graph.refine.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )

    function dragstarted(event) {
      if (!event.active) graph.simulation.alphaTarget(0.3).restart()
      event.subject.tx = event.subject.fx
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event) {
      if (!event.active) graph.simulation.alphaTarget(0)
      event.subject.fx = event.subject.tx
      event.subject.fy = null
      event.subject.tx = undefined
    }

    function nodeClick(event) {
      if (graph.hasMenu && !graph.menu.isOpen)
        graph.menu.open(event.clientX, event.clientY)

      graph.menu.target = event.target.__data__
    }
  }
  graph.update = update

  function attachMenu(menu) {
    graph.menu = menu
    graph.hasMenu = true
  }
  graph.attachMenu = attachMenu

  return graph
}
