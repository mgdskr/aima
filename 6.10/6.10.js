const dotNum = 20

//rotate function show whether point C lays to right or to left from AB vector
const rotate = (A, B, C) => {
  return (B[0] - A[0]) * (C[1] - B[1]) - (B[1] - A[1]) * (C[0] - B[0])
}

const isIntersects = (A, B, C, D) => {
  return rotate(A, B, C) * rotate(A, B, D) <= 0 && rotate(C, D, A) * rotate(C, D, B) < 0
}


const $canvas = document.getElementById('canvas')
$canvas.width = 800
$canvas.height = 800

const ctx = $canvas.getContext('2d')

//draw helpers

const drawBoldPoint = ({id, x, y}) => {
  ctx.fillStyle = '#000'
  ctx.fillRect(x - 4, y - 4, 8, 8)
  ctx.font = "16px monospace"
  const textX = x + 25 > $canvas.width ? x - 20 : x + 5
  const textY = y + 25 > $canvas.height ? y - 20 : y + 5
  ctx.fillText(id, textX, textY)
}

const drawLine = ([[x1, y1], [x2, y2]]) => {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = '#999'
  ctx.stroke()
}


const getRandomPointCoos = maxValue => {
  return Math.floor(Math.random() * maxValue) + 1
}

const generateRandomPoints = pointsNum => {
  return Array.from({length: pointsNum}, (_, idx) => ({
    id: idx,
    x: getRandomPointCoos($canvas.width),
    y: getRandomPointCoos($canvas.height)
  }))
}


const getAllNeighbors = points => {
  const allPointsWithNeighbors = points.map(currentPoint => {
    const allPoints = [...points]
    allPoints.splice(currentPoint.id, 1)
    const neighbors = allPoints.map(point => {
      return {
        neighborId: point.id,
        distance: Math.sqrt(Math.hypot(point.x - currentPoint.x, point.y - currentPoint.y))
      }
    })
    const sortedNeighbors = neighbors.sort((a, b) => a.distance - b.distance)
    // return {id: currentPoint.id, neighbors: sortedNeighbors}
    return sortedNeighbors
  })
  return allPointsWithNeighbors
}


const getConnections = () => {
  let connections = Array.from({length: dotNum}, _ => ([]))
  let existingLines = []
  let isAllConnected = false

  const notIntersectsExistingLines = ([[x1, y1], [x2, y2]], existingLines) => {
    const isIntersectAnyExistingLine = existingLines.some(line => isIntersects([x1, y1], [x2, y2], line[0], line[1]))
    return existingLines.length === 0 || !isIntersectAnyExistingLine
  }

  const connectRandomDotToNearestNeighbor = () => {
    shuffledPointsIds.forEach(startPointId => {
      const startPoint = points.find(point => point.id === startPointId)
      const startPointNeighbors = allNeighbors[startPointId]
      let notIntersects = false
      while (!notIntersects && startPointNeighbors.length > 0) {
        const endPointId = startPointNeighbors[0].neighborId
        let endPointNeighbors = allNeighbors[endPointId]
        const isConnectionExists = connections[startPointId].includes(endPointId)
        if (!isConnectionExists) {
          const endPoint = points.find(point => point.id === endPointId)
          const line = [[startPoint.x, startPoint.y], [endPoint.x, endPoint.y]]
          notIntersects = notIntersectsExistingLines(line, existingLines)
          if (notIntersects) {
            existingLines.push(line)
            connections[startPointId].push(endPointId)
            connections[endPointId].push(startPointId)
          }
        }
        startPointNeighbors.shift()
        if (startPointNeighbors.length === 0) {
          shuffledPointsIds.splice(shuffledPointsIds.indexOf(startPointId), 1)
        }
        endPointNeighbors = endPointNeighbors.filter(neighbor => neighbor.neighborId !== startPointId)
        if (endPointNeighbors === 0) {
          shuffledPointsIds.splice(shuffledPointsIds.indexOf(endPointId), 1)
        }
      }
    })
  }

  while (shuffledPointsIds.length > 0) {
    connectRandomDotToNearestNeighbor()
  }

  existingLines.forEach(line => drawLine(line))

  return connections
}

const shufflePoints = (pointA, pointB) => Math.random() > 0.5 ? -1 : 1


const points = generateRandomPoints(dotNum)
const allNeighbors = getAllNeighbors(points)
const shuffledPointsIds = points.sort(shufflePoints).map(point => point.id)
points.forEach(point => drawBoldPoint(point))
const connections = getConnections()

console.log(connections)
