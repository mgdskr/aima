const initialState = Array.from({length: 9}, _ => 'empty')

const calculateUtility = state => {
  let filledCellsNum = state.filter(cell => cell !== 'empty').length

  if (filledCellsNum < 5) {
    return null
  }

  let utility = null
  let sum

  const isTerminalState = sum => {
    if (sum === 3) {
      utility = 1
    } else if (sum === 0) {
      utility = 0
    }
  }

  //by rows
  for (let i = 0; i < 3 && utility === null; i++) {
    isTerminalState(state[i * 3] + state[i * 3 + 1] + state[i * 3 + 2])
  }
  //by columns
  for (let i = 0; i < 3 && utility === null; i++) {
    isTerminalState(state[i] + state[i + 3] + state[i + 6])
  }
  //by diagonals
  if (utility === null) {
    isTerminalState(state[0] + state[4] + state[8])
  }
  if (utility === null) {
    isTerminalState(state[2] + state[4] + state[6])
  }

  if (filledCellsNum === 9 && utility === null) {
    utility = 0.5
  }

  return utility
}


const doAction = (state, action) => {
  const newState = [...state]
  newState[action.cellId] = action.activePlayer
  return newState
}


const getNextBestNodeByMiniMax = CurrentState => {
  const state = [...CurrentState]

  const emptyCells = state.reduce((acc, cellValue, idx) => {
    if (cellValue === 'empty')
      acc.push(idx)
    return acc
  }, [])

  //if number of empty cells is even - active player is X, odd - O
  const activePlayer = emptyCells.length % 2 ? 1 : 0

  const newNodesWithUtility = emptyCells.map(cellId => {
    const newState = doAction(state, {cellId, activePlayer})

    let nodeUtility = calculateUtility(newState)

    if (nodeUtility === null) {
      const deeperNode = getNextBestNodeByMiniMax(newState)
      nodeUtility = deeperNode.nodeUtility
    }

    return {nodeId: cellId, state: newState, nodeUtility}
  })

  const sortFunc = (nodeA, nodeB) => {
    return activePlayer === 1
      ? -nodeA.nodeUtility + nodeB.nodeUtility
      : nodeA.nodeUtility - nodeB.nodeUtility
  }

  return newNodesWithUtility.sort(sortFunc)[0]

}


const renderState = state => {
  const replaceByChar = {
    1: 'X',
    0: 'O',
    'empty': ' '
  }
  const renderingState = state.map(cell => replaceByChar[cell])

  console.log(`%c
  ===========
   ${renderingState[0]} | ${renderingState[1]} | ${renderingState[2]}
  -----------
   ${renderingState[3]} | ${renderingState[4]} | ${renderingState[5]}
  -----------
   ${renderingState[6]} | ${renderingState[7]} | ${renderingState[8]}
  ===========
  `, 'font-family: monospace; font-size: 19px')
}


let state = initialState
let gameSteps = []
let gameOver = false

while (state.filter(cell => cell === 'empty').length && !gameOver) {
  const newNode = getNextBestNodeByMiniMax(state)
  state = newNode.state
  renderState(state)

  const currentStateUtility = calculateUtility(state)
  if (currentStateUtility !== null) {
    gameOver = true
    console.log('game over')
    // console.log(gameSteps)
  }

  gameSteps.push(newNode.nodeId)

}

