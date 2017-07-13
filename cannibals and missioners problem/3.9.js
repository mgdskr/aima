const initialState = {cannibals: 3, missioners: 3, stateId: 33}
const actions = [
  {actionId: 1, cannibals: 0, missioners: 1},
  {actionId: 2, cannibals: 0, missioners: 2},
  {actionId: 3, cannibals: 1, missioners: 1},
  {actionId: 4, cannibals: 1, missioners: 0},
  {actionId: 5, cannibals: 2, missioners: 0},
]


let direction = "forward"
let nodesCounter = 0

let frontier = [
  {
    state: initialState,
    parentNodeId: null,
    id: nodesCounter,
    lastActionId: 0
  }
]
let explored = []
let answerIsFound = false


const calculateNewState = (state, action, direction) => {

  const sign = direction === 'backward' ? -1 : 1
  const cannibals = state.cannibals - sign * action.cannibals
  if (cannibals < 0 || cannibals > 3) {
    return
  }
  const missioners = state.missioners - sign * action.missioners
  if (missioners < 0 || missioners > 3) {
    return
  }
  if (!(cannibals === missioners || missioners === 3 || missioners === 0)) {
    return
  }

  const stateId = cannibals * 10 + missioners

  return {cannibals: cannibals, missioners: missioners, stateId: stateId}
}

const isDestinationNode = (state) => {
  return state.cannibals === 0 && state.missioners === 0

}

const newStateIsUnique = (frontier, explored, newNodes, newState) => {
  const existingStates = [...frontier, ...explored, ...newNodes]
  return existingStates.every(node => node.stateId !== newState.stateId)
}

while (!answerIsFound) {
  let newNodes = []
  frontier.map(node => {
    actions.map(action => {
      if (action.actionId === node.lastActionId) {
        return
      }
      const newState = calculateNewState(node.state, action, direction)
      if (newState && newStateIsUnique(frontier, explored, newNodes, newState)) {
        const newNode = {
          state: newState,
          parentNodeId: node.id,
          id: ++nodesCounter,
          lastActionId: action.actionId,
          lastAction: actions[action.actionId - 1],
          direction
        }
        newNodes.push(newNode)
        answerIsFound = isDestinationNode(newState)
      }
    })
  })


  explored = [...explored, ...frontier]


  frontier = newNodes

  direction = direction === 'forward' ? 'backward' : 'forward'

}

//add final node to explored
if (answerIsFound) {
  frontier.map(node => {
    if (node.state.cannibals === 0 && node.state.missioners === 0) {
      explored.push(node)
    }
  })
}

const lastNode = explored[explored.length - 1]
let reverseRoute = [lastNode]
let parentIndex = lastNode.parentNodeId

while (parentIndex !== null) {
  explored.map(node => {
    if (node.id === parentIndex) {
      reverseRoute.push(node)
      parentIndex = node.parentNodeId
    }
  })
}

const route = reverseRoute.reverse()

const renderRoute = route => {
  const renderCannibals = {0: '___', 1: 'C__', 2: 'CC_', 3: 'CCC'}
  const renderMissioners = {0: '___', 1: 'M__', 2: 'MM_', 3: 'MMM'}
  const renderBoat = {0: '(____)', 1: '(___M)', 2: '(__MM)', 3: '(C__М)', 4: '(C___)', 5: '(CС__)'}
  route.map(node => {
    const eastCoast = renderCannibals[node.state.cannibals] + renderMissioners[node.state.missioners]
    const westCoast = renderCannibals[3 - node.state.cannibals] + renderMissioners[3 - node.state.missioners]
    const boat = renderBoat[node.lastActionId]
    let sea = ` ~~~ ${boat} ~~~ `
    if (node.direction) {
      if (node.direction === 'forward') {
        sea = ` >>> ${boat} === `
      } else if (node.direction === 'backward') {
        sea = ` === ${boat} <<< `
      }
    }
    console.log(`East Coast ${eastCoast} | ${sea} | ${westCoast} West Coast`)
  })
}
renderRoute(route)