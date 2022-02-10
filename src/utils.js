// appends a canvas element to the body and retruns it
export const setupCanvas = (id, width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width || 800
  canvas.height = height || 600
  canvas.id = id || `id-${Date.now()}`

  document.body.append(canvas)

  return canvas
}

// returns the gl context
export const setupGl = (canvas) => {
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  if (!gl) {
    console.error(`ERROR: webgl not supported`)
    return null
  }

  return gl
}

// appends an image tag to body with 0 height and width so it wont show, and returns the id
export const loadTexture = (source, id) => {
  const image = document.createElement('img')
  image.src = source
  image.id = id || `id-${Date.now()}`
  image.height = 0
  image.width = 0
  document.body.append(image)
  return image
}
