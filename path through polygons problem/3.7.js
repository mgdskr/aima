const canvas = document.querySelector('#canvas')
canvas.width = 500
canvas.height = 500

const ctx = canvas.getContext('2d')
const startPoint = [5, 5]
const goalPoint = [495, 495]
ctx.fillStyle = '#000'
ctx.fillRect(5, 5, 3, 3)
ctx.fillRect(495, 495, 3, 3)

const polygons = []
const polygonA = [[10, 20], [40, 10], [100, 50], [90, 100], [0, 190]]
const polygonB = [[150, 35], [200, 5], [250, 300], [150, 400], [100, 200]]
const polygonC = [[270, 40], [290, 40], [400, 450], [300, 300]]
polygons.push(polygonA)
polygons.push(polygonB)
polygons.push(polygonC)


const drawPolygons = polygons => {
  ctx.fillStyle = '#eee'
  polygons.map(([[x0, y0], ...vertexes]) => {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    vertexes.forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.closePath()
    ctx.fill()
    // ctx.stroke()
  })
}

drawPolygons(polygons)

const drawPoint = ([x, y]) => {
  ctx.fillRect(x - 2, y - 2, 4, 4)
}

const drawBoldPoint = ([x, y]) => {
  ctx.fillStyle = '#000'
  ctx.fillRect(x - 4, y - 4, 8, 8)
}

const drawLine = ([x1, y1], [x2, y2]) => {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = '#999'
  ctx.stroke()
}

const drawRedLine = ([x1, y1], [x2, y2]) => {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineWidth = 3
  ctx.strokeStyle = '#0f0'
  ctx.stroke()
}

const drawLineSlowly = ([x1, y1], [x2, y2]) => {
  //create equation
  //y = k * x + b
  const k = (y2 - y1) / (x2 - x1)
  const b = y2 - k * x2
  const segmentsQty = 10
  const segmentLength = (x2 - x1) / segmentsQty //could be negative
  let i = 1
  let xStart = x1
  let yStart = y1
  let xEnd
  let yEnd

  const drawSegment = () => {
    xEnd = x1 + i * segmentLength
    yEnd = k * xEnd + b
    drawLine([xStart, yStart], [xEnd, yEnd])
    xStart = xEnd
    yStart = yEnd
    i++
    if (i > segmentsQty) {
      clearInterval(intervalId)
    }
  }

  const intervalId = setInterval(drawSegment, 30)
}


const SLD = ([x1, y1]) => ([x2, y2]) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

const SLDTOGoalPoint = SLD(goalPoint)

const vertexes = [goalPoint]
polygons.map(polygon => polygon.map(vertex => vertexes.push(vertex)))

const nodesWithHeuristicFunction = (vertexes, goalPoint) => {
  let nodes = []
  let nodesCounter = 1

  vertexes.forEach(vertex => {
    const pathCostFunc = 0 // the cost to reach node N form start point
    const heuristicFunc = SLDTOGoalPoint(vertex) // the cost to get from node N to goal point
    const estimatedCostFunc = heuristicFunc + pathCostFunc
    let node = {
      nodeId: nodesCounter++,
      coordinates: vertex,
      pathCostFunc,
      heuristicFunc,
      estimatedCostFunc,
      explored: false
    }
    nodes.push(node)
  })

  return nodes
}

//currentPoint is the node from which we have to recalculate estimated cost functions for all nodes
const updateNodesEstimatedCostFunc = nodes => currentPoint => {
  return nodes.map(node => {
    const pathCostFunc = currentPoint.pathCostFunc + SLD(currentPoint.coordinates)(node.coordinates)
    const estimatedCostFunc = pathCostFunc + node.estimatedCostFunc
    return Object.assign({}, node, {estimatedCostFunc, pathCostFunc})
  })
}

const allNodes = nodesWithHeuristicFunction(vertexes, goalPoint)
const updateNodesEstimatedCostFuncFromCurrentPoint = updateNodesEstimatedCostFunc(allNodes)

//polygon sides and diagonals
const generateLines = polygon => {
  let sidesAndDiagonals = []
  const initialPolygonLength = polygon.length

  for (let i = initialPolygonLength - 1; i >= 0; i--) {
    const startPoint = polygon.pop()
    for (let j = polygon.length - 1; j >= 0; j--) {
      const endPoint = polygon[j]
      sidesAndDiagonals.push([startPoint, endPoint])
    }
  }

  return sidesAndDiagonals
}

let lines = []
polygons.map(polygon => lines.push(...generateLines(polygon)))

//rotate function show whether point C lays to right or to left from AB vector
const rotate = (A, B, C) => {
  return (B[0] - A[0]) * (C[1] - B[1]) - (B[1] - A[1]) * (C[0] - B[0])
}

const intersect = (A, B, [C, D]) => {
  return rotate(A, B, C) * rotate(A, B, D) <= 0 && rotate(C, D, A) * rotate(C, D, B) < 0
}

const startNode = {
  nodeId: 0,
  coordinates: startPoint,
  pathCostFunc: 0,
  estimatedCostFunc: SLDTOGoalPoint(startPoint),
  parentNodeId: null,
  explored: false
}

//state is a list of all reachable unexplored nodes (frontier) and explored nodes
let state = []
state.push(startNode)
let isRouteFound = false

const checkForGoal = (nodes) => {
  return nodes.some(node => node.heuristicFunc === 0)
}
const checkForGoalNode = (nodes) => {
  return nodes.filter(node => node.heuristicFunc === 0)
}

const expandNode = nodeToExpand => {
  const allNodesWithPathCost = updateNodesEstimatedCostFuncFromCurrentPoint(nodeToExpand)
  const reachableNodes = allNodesWithPathCost
    .filter(node => !lines.some(line => intersect(nodeToExpand.coordinates, node.coordinates, line)))
    .map(node => {
      drawLineSlowly(nodeToExpand.coordinates, node.coordinates)
      return Object.assign({}, node, {parentNodeId: nodeToExpand.nodeId})
    })

  return reachableNodes
}

const generateFrontier = state => {
  const stateFilteredAndSortedByPathCost = state
    .filter(node => !node.explored)
    .sort((nodeA, nodeB) => nodeA.estimatedCostFunc - nodeB.estimatedCostFunc)
  const nodeWithLowestPathCost = stateFilteredAndSortedByPathCost[0]

  if (nodeWithLowestPathCost.heuristicFunc === 0) {
    isRouteFound = true
    return []
  }

  state.forEach(node => {
    if (node.nodeId === nodeWithLowestPathCost.nodeId) {
      node.explored = true
    }
  })

  drawBoldPoint(nodeWithLowestPathCost.coordinates)
  const newNodes = expandNode(nodeWithLowestPathCost)
  const existingNodesIndexes = state.map(node => node.nodeId)

  return newNodes.filter(node => existingNodesIndexes.every(nodeIdx => nodeIdx !== node.nodeId))
}

const traceBackSolution = state => {
  let currentNode = state.find(node => node.heuristicFunc === 0)
  let parentNode = state.find(node => node.nodeId === currentNode.parentNodeId)
  do {
    drawRedLine(currentNode.coordinates, parentNode.coordinates)
    currentNode = parentNode
    parentNode = state.find(node => node.nodeId === currentNode.parentNodeId)
  } while (parentNode)
}

const updateState = () => {
  state = state.concat(...generateFrontier(state))
  if (isRouteFound) {
    clearInterval(intervalId)
    console.log('answer', isRouteFound)
    console.log(state)
    traceBackSolution(state)
  }
}

const intervalId = setInterval(updateState, 1000)