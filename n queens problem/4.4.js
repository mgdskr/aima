const checkAttacking = (row1, row2, col1, col2) => {
  const attackingHorizontally = row1 === row2
  const attackingDiagonally = Math.abs(row1 - row2) === Math.abs(col1 - col2)
  return attackingHorizontally || attackingDiagonally ? 1 : 0
}

const calculateObjectiveFunc = stateCode => {
  const stateArray = [...stateCode]
  let attackingPairs = 0
  while (stateArray.length > 0) {
    const row1 = stateArray.pop()
    const col1 = stateArray.length + 1
    stateArray.map((row2, idx) => {
      const col2 = idx + 1
      attackingPairs += checkAttacking(row1, row2, col1, col2)
    })
  }
  return attackingPairs
}

const generateRandomState = () => {
  const queensNum = 8
  const usedRows = []
  const getRandomRow = () => Math.floor(Math.random() * queensNum) + 1
  const getUnusedRandomRow = () => {
    let randomRow
    do {
      randomRow = getRandomRow()
      if (!usedRows.includes(randomRow)) {
        usedRows.push(randomRow)
        return randomRow
      }
    } while (true)
  }
  const code = Array.from({length: queensNum}, () => getUnusedRandomRow())
  const objectiveFunc = calculateObjectiveFunc(code)
  return {code, objectiveFunc}
}

const renderState = code => {
  if (typeof code === 'string') {
    code = JSON.parse(code)
  }
  let queensNum = code.length
  let board = Array.from({length: queensNum ** 2}, (_, x) => ' _')
  const linearPositions = code.map((row, col) => col + (row - 1) * queensNum)

  linearPositions.forEach(el => {
    board[el] = ' X'
  })

  let renderBoard = ''
  while (board.length > 0) {
    renderBoard += board.splice(0, queensNum).join('') + '\n'
  }
  console.log(renderBoard)
}

const mutateStateCodeAtPositionX = (stateCode, position) => {
  const queensNum = stateCode.length
  const currentState = [...stateCode]
  const valueAtPosition = stateCode[position]
  const mutatedStatesCodes = []

  if (valueAtPosition - 1 > 0) {
    const mutatedLower = currentState.map((value, idx) => position !== idx ? value : value - 1)
    mutatedStatesCodes.push(mutatedLower)
  }
  if (valueAtPosition + 1 <= queensNum) {
    const mutatedHigher = currentState.map((value, idx) => position !== idx ? value : value + 1)
    mutatedStatesCodes.push(mutatedHigher)
  }

  return mutatedStatesCodes
}


const getFrontier = ({code}) => {
  const newStatesCodes = []
  const queenNum = code.length

  for (let i = 0; i < queenNum; i++) {
    newStatesCodes.push(...mutateStateCodeAtPositionX(code, i))
  }

  return newStatesCodes.map(code => {
    const objectiveFunc = calculateObjectiveFunc(code)

    return {code, objectiveFunc}
  })
}

const lookForSolution = () => {
  let restartsCount = 1
  let isSolutionFound = false
  let currentState = generateRandomState()
  let frontier = []
  let ancestor = {}

  while (!isSolutionFound) {
    frontier = getFrontier(currentState)
      .sort((stateA, stateB) => stateA.objectiveFunc - stateB.objectiveFunc)
    ancestor = frontier[0]

    if (ancestor.objectiveFunc === 0) {
      isSolutionFound = true
    } else if (ancestor.objectiveFunc <= currentState.objectiveFunc) {
      ancestor = generateRandomState()
      restartsCount++
    }
    currentState = ancestor
  }
  return ancestor.code
}

const getNSolutions = n => {
  if (n > 92) {
    throw new Error('Maximum number of solutions is 92')
  }
  let allSolutions = []

  const startTime = new Date()

  while (allSolutions.length < n) {
    let solution = lookForSolution()
    let queensNum = solution.length
    let additionalSolutionByMirroringHorizontally = solution.map(el => queensNum + 1 - el)
    let additionalSolutionByMirroringVertically = solution.map((_, idx, array) => array[queensNum - idx - 1])
    let additionalSolutionByMirroringHorizontallyAndVertically = additionalSolutionByMirroringVertically.map(el => queensNum + 1 - el)

    let solutions = [
      solution,
      additionalSolutionByMirroringHorizontally,
      additionalSolutionByMirroringVertically,
      additionalSolutionByMirroringHorizontallyAndVertically
    ]
    solutions.forEach(solution => {
      let solutionString = JSON.stringify(solution)
      if (!allSolutions.includes(solutionString)) {
        allSolutions.push(solutionString)
        // console.log(allSolutions.length)
      }
    })

  }
  const time = new Date() - startTime
  console.log(`All ${n} solutions were found in ${time}ms`)
  console.log(allSolutions)

  return allSolutions

}

const allSolutions = getNSolutions(92)
renderState(allSolutions[0])