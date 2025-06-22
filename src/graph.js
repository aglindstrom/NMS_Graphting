import * as d3 from "d3"

import { getItemDetailbyAppId } from "./requests/itemDetail.js"

export default function Graph(nodes = [], links = []) {
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
  graph.back = graph.svg.append("g").selectAll(".back")
  graph.node = graph.svg.append("g").selectAll(".node")

  document.addEventListener("updateGraph", (event) => {
    const index = graph.names.data?.indexOf(event.detail.node[0].name) ?? -1
    const sourceId = graph.nodes.data[index]?.id ?? event.detail.node[0].appId
    const indexDepth = graph.nodes.data[index]?.id.split(":").length + 2 ?? 2
    graph.depth = indexDepth > graph.depth ? indexDepth : graph.depth

    event.detail.node.forEach((item) => {
      item.id = `${sourceId}:${item.appId}`
      item.open = false
    })
    event.detail.node[0].id = event.detail.node[0].appId
    event.detail.node[0].open = true

    if (index === -1) {
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

  function render() {
    graph.simulation.nodes(graph.nodes.data).on("tick", () => {
      graph.link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      graph.node.attr("x", (d) => d.x - 25).attr("y", (d) => d.y - 25)

      graph.back.attr("x", (d) => d.x - 25).attr("y", (d) => d.y - 25)
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

    graph.back = graph.back.data(graph.nodes.data, (d) => d.id)
    graph.back.exit().remove()
    graph.back = graph.back
      .enter()
      .append("rect")
      .attr("class", "back")
      .attr("width", "50")
      .attr("height", "50")
      .attr("fill", (d) => `#${d.colour}` ?? "#000")
      .attr("stroke-width", "2px")
      .attr("stroke", "#fff")
      .merge(graph.back)

    graph.node = graph.node.data(graph.nodes.data, (d) => d.id)
    graph.node.exit().remove()
    graph.node = graph.node
      .enter()
      .append("image")
      .attr("class", "node")
      .attr("href", (d) => d.iconUrl)
      .attr("width", "50px")
      .attr("height", "50px")
      .on("click", nodeClick)
      .on("mouseenter", (e) => {
        if (graph.hasMenu && !graph.menu.isOpen)
          graph.menu.open(e.clientX, e.clientY)
      })
      .merge(graph.node)

    graph.node.append("title").text((d) => d.name)

    graph.node.call(
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
      const item = event.target.__data__

      if (item.open === false && item.requiredItems.length !== 0) {
        getItemDetailbyAppId(item.appId, "updateGraph")
        item.open = true
      }
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
