import * as d3 from 'd3'

import { getItemDetailbyAppId } from './requests/itemDetail.js'

export default function Graph(nodes=[], links=[]){
  const constructor = {
    width: document.querySelector('#graph').scrollWidth,
    height: document.querySelector('#graph').scrollHeight,
    names: {data:null},
    links: {data:links},
    nodes: {data:nodes},
    hovered: null,
    depth: 2
  }

  setUp()
  constructor.link = constructor.svg.append('g').selectAll('.link')
  constructor.back = constructor.svg.append('g').selectAll('.back')
  constructor.node = constructor.svg.append('g').selectAll('.node')

  document.addEventListener('updateGraph', (event) => {
    const index = constructor.names.data?.indexOf(event.detail.node[0].name) ?? -1
    const sourceId = constructor.nodes.data[index]?.id ?? event.detail.node[0].appId
    const indexDepth = constructor.nodes.data[index]?.id.split(':').length + 2 ?? 2
    constructor.depth = indexDepth > constructor.depth ? indexDepth:constructor.depth 


    event.detail.node.forEach(item => item.id = `${sourceId}:${item.appId}`)
    event.detail.node[0].id = event.detail.node[0].appId

    if(index === -1){
      constructor.depth = event.detail.node.length === 1 ? 2 : 3
      constructor.names.data = event.detail.node.map(d => d.name) ?? []
      constructor.nodes.data = event.detail.node ?? []
    }else{
      constructor.names.data.splice(index, 0, ...event.detail.node.slice(1).map(d => d.name))
      constructor.nodes.data.splice(index, 0, ...event.detail.node.slice(1))
    }

    const xStep = constructor.width / constructor.depth
    constructor.nodes.data.forEach(item => item.fx = (xStep*(item.id.split(':').length)-(constructor.width/2)))
    constructor.links.data = [...constructor.links.data, ...event.detail.node.slice(1).map(item => ({source: sourceId, target: item.id}))] ?? []
    
    console.log(index, constructor.names.data, constructor.nodes.data, constructor.links.data)
    update()
    render()
  })

  function setUp(){
    constructor.svg = d3.select('#graph').append("svg")
      .attr("width", constructor.width)
      .attr("height", constructor.height)
      .attr("viewBox", [-constructor.width / 2, -constructor.height / 2, constructor.width, constructor.height])
      .attr("style", "max-width: 100%; height: auto;");

    constructor.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("y", d3.forceY())
      .force("x", d3.forceX())
  }

  function render(){
    constructor.simulation
      .nodes(constructor.nodes.data).on("tick", () => {
      constructor.link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      constructor.node
        .attr('x', d => d.x-25)
        .attr('y', d => d.y-25)
      
      constructor.back
        .attr('x', d => d.x-25)
        .attr('y', d => d.y-25)
    })

    constructor.simulation.force("charge").strength(-1000)
    constructor.simulation.force("link").links(constructor.links.data).strength(.5)
    constructor.simulation.alpha(1).restart()
  } constructor.render = render;

  function update(){
    if(!constructor.nodes) return
    constructor.nodes.data.map(d => d.t = 0)

    constructor.link = constructor.link.data(constructor.links.data, d => d.source.id ?? d.source + '-' + d.target.id ?? d.target)
    constructor.link.exit().remove()
    constructor.link = constructor.link.enter()
      .append('line')
        .attr('class', 'link')
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .merge(constructor.link);

    constructor.back = constructor.back.data(constructor.nodes.data, d => d.id)
    constructor.back.exit().remove()
    constructor.back = constructor.back.enter()
      .append('rect')
        .attr('class', 'back')
        .attr('width', '50')
        .attr('height', '50')
        .attr('fill', d => `#${d.colour}` ?? '#000')
        .attr('stroke-width', '2px')
        .attr('stroke', '#fff')
      .merge(constructor.back);

    constructor.node = constructor.node.data(constructor.nodes.data, d => d.id)
    constructor.node.exit().remove()
    constructor.node = constructor.node.enter()
      .append('image')
        .attr('class', 'node')
        .attr('href', d => d.iconUrl)
        .attr('width', '50px')
        .attr('height', '50px')
      .on('click', nodeClick)
      .merge(constructor.node);

    constructor.node.append('title').text(d => d.name)

    constructor.node.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    function dragstarted(event) {
      if (!event.active) constructor.simulation.alphaTarget(0.3).restart()
      event.subject.tx = event.subject.fx;
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) constructor.simulation.alphaTarget(0)
      event.subject.fx = event.subject.tx
      event.subject.fy = null
      event.subject.tx = undefined
    }

    function nodeClick(event) {
      const item = event.target.__data__.appId
      getItemDetailbyAppId(item, 'updateGraph')
    }
  } constructor.update = update;

  return constructor
}