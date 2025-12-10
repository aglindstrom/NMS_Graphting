const nodes = []
const links = []

function addNode(parentId, toAdd) {
  const parentIndex = nodes.findIndex((node) => node.id === parentId)
  console.log(parentIndex)
  addLink(parent, node)
}

function addLink(source, target) {}

export default {
  nodes,
  links,
  addNode: addNode,
  addLink: addLink,
}
