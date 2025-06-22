import * as d3 from "d3";

import { getItemDetailbyAppId } from "./requests/itemDetail.js";

export default function Graph(nodes = [], links = []) {
  const fields = {
    width: document.querySelector("#graph").scrollWidth,
    height: document.querySelector("#graph").scrollHeight,
    names: { data: null },
    links: { data: links },
    nodes: { data: nodes },
    bars: { data: null },
    hovered: null,
    depth: 2,
  };

  setUp();
  fields.link = fields.svg.append("g").selectAll(".link");
  fields.back = fields.svg.append("g").selectAll(".back");
  fields.node = fields.svg.append("g").selectAll(".node");

  document.addEventListener("updateGraph", (event) => {
    const index = fields.names.data?.indexOf(event.detail.node[0].name) ?? -1;
    const sourceId = fields.nodes.data[index]?.id ?? event.detail.node[0].appId;
    const indexDepth = fields.nodes.data[index]?.id.split(":").length + 2 ?? 2;
    fields.depth = indexDepth > fields.depth ? indexDepth : fields.depth;

    event.detail.node.forEach((item) => {
      item.id = `${sourceId}:${item.appId}`;
      item.open = false;
    });
    event.detail.node[0].id = event.detail.node[0].appId;
    event.detail.node[0].open = true;

    if (index === -1) {
      fields.depth = event.detail.node.length === 1 ? 2 : 3;
      fields.names.data = event.detail.node.map((d) => d.name) ?? [];
      fields.nodes.data = event.detail.node ?? [];
      fields.links.data =
        [
          ...event.detail.node
            .slice(1)
            .map((item) => ({ source: sourceId, target: item.id })),
        ] ?? [];
    } else {
      fields.names.data.splice(
        index,
        0,
        ...event.detail.node.slice(1).map((d) => d.name)
      );
      fields.nodes.data.splice(index, 0, ...event.detail.node.slice(1));
      fields.links.data =
        [
          ...fields.links.data,
          ...event.detail.node
            .slice(1)
            .map((item) => ({ source: sourceId, target: item.id })),
        ] ?? [];
    }

    const xStep = fields.width / fields.depth;
    fields.nodes.data.forEach((item) => {
      item.fx = xStep * item.id.split(":").length - fields.width / 2;
      item.pull = item.id.split(":").length;
    });

    update();
    render();
  });

  function setUp() {
    fields.svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", fields.width)
      .attr("height", fields.height)
      .attr("viewBox", [
        -fields.width / 2,
        -fields.height / 2,
        fields.width,
        fields.height,
      ])
      .attr("style", "max-width: 100%; height: auto;");

    fields.simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force("y", d3.forceY())
      .force("x", d3.forceX());
  }

  function render() {
    fields.simulation.nodes(fields.nodes.data).on("tick", () => {
      fields.link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      fields.node.attr("x", (d) => d.x - 25).attr("y", (d) => d.y - 25);

      fields.back.attr("x", (d) => d.x - 25).attr("y", (d) => d.y - 25);
    });

    fields.simulation.force("charge").strength((d) => -2000 / d.pull);
    fields.simulation.force("link").links(fields.links.data).strength(0.05);
    fields.simulation.alpha(1).restart();
  }
  fields.render = render;

  function update() {
    if (!fields.nodes) return;
    fields.nodes.data.map((d) => (d.t = 0));

    fields.link = fields.link.data(
      fields.links.data,
      (d) => d.source.id ?? d.source + "-" + d.target.id ?? d.target
    );
    fields.link.exit().remove();
    fields.link = fields.link
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .merge(fields.link);

    fields.back = fields.back.data(fields.nodes.data, (d) => d.id);
    fields.back.exit().remove();
    fields.back = fields.back
      .enter()
      .append("rect")
      .attr("class", "back")
      .attr("width", "50")
      .attr("height", "50")
      .attr("fill", (d) => `#${d.colour}` ?? "#000")
      .attr("stroke-width", "2px")
      .attr("stroke", "#fff")
      .merge(fields.back);

    fields.node = fields.node.data(fields.nodes.data, (d) => d.id);
    fields.node.exit().remove();
    fields.node = fields.node
      .enter()
      .append("image")
      .attr("class", "node")
      .attr("href", (d) => d.iconUrl)
      .attr("width", "50px")
      .attr("height", "50px")
      .on("click", nodeClick)
      .merge(fields.node);

    fields.node.append("title").text((d) => d.name);

    fields.node.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    function dragstarted(event) {
      if (!event.active) fields.simulation.alphaTarget(0.3).restart();
      event.subject.tx = event.subject.fx;
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) fields.simulation.alphaTarget(0);
      event.subject.fx = event.subject.tx;
      event.subject.fy = null;
      event.subject.tx = undefined;
    }

    function nodeClick(event) {
      const item = event.target.__data__;

      if (item.open === false && item.requiredItems.length !== 0) {
        getItemDetailbyAppId(item.appId, "updateGraph");
        item.open = true;
      }
    }
  }
  fields.update = update;

  return fields;
}
