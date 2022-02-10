import { mat4, glMatrix } from 'gl-matrix'
import { loadTexture, setupCanvas, setupGl } from './utils.js'
import fragmentShaderText from './shaders/shader.fs.glsl'
import vertexShaderText from './shaders/shader.vs.glsl'
import cubeData from './shapes/cube.js'
import textureImage from './textures/texture.png'

const App = () => {
  // canvas element
  const canvas = setupCanvas()

  // get gl context and test for error
  const gl = setupGl(canvas)
  if (!gl) return

  // cull back faces
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.frontFace(gl.CCW)
  gl.cullFace(gl.BACK)

  // =========================================================
  // SHADERS
  // =========================================================
  // create shadders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  // shader text
  gl.shaderSource(vertexShader, vertexShaderText)
  gl.shaderSource(fragmentShader, fragmentShaderText)

  // compile shaders
  gl.compileShader(vertexShader)
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      'ERROR compiling vertex shader!',
      gl.getShaderInfoLog(vertexShader)
    )
    return null
  }

  gl.compileShader(fragmentShader)
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      'ERROR compiling fragment shader!',
      gl.getShaderInfoLog(fragmentShader)
    )
    return null
  }

  // =========================================================
  // PROGRAM
  // =========================================================
  const program = gl.createProgram()
  // attach shaders to program
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  // link program and test for errors
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(program))
    return
  }
  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program!', gl.getProgramInfoLog(program))
    return
  }

  // =========================================================
  // CUBE BUFFER
  // =========================================================
  // create vertex buffer
  const cubeVBO = gl.createBuffer() // VBO stands for vertex buffer object
  // bind buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO)
  // add data to buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(cubeData.vertices),
    gl.STATIC_DRAW
  )

  // create Indices buffer
  const cubeIBO = gl.createBuffer() // VBO stands for Indices buffer object
  // bind buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO)
  // add data to buffer
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeData.indices),
    gl.STATIC_DRAW
  )

  // point program to shader atribute ( add atributes to shader)
  // each vertex on the VBO has 5 points 3 space coordenates and 2 texture coordenates
  const positionAttribLocation = gl.getAttribLocation(program, 'vertexPosition') // added  vertexPosition to shader as a vec3 becasue it has 3 coords (x,y,z)
  const texCoordAttribLocation = gl.getAttribLocation(
    program,
    'vertextTextureCoord'
  ) // added vertexTextureCoord to vertex shader to point to the coordenates of the texture as vec2 (only x and y)

  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  )
  gl.vertexAttribPointer(
    texCoordAttribLocation, // Attribute location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  )

  // eneble attribs
  gl.enableVertexAttribArray(positionAttribLocation)
  gl.enableVertexAttribArray(texCoordAttribLocation)

  // =========================================================
  // CUBE TEXTURE
  // =========================================================
  // load asset
  const cubeTextureImage = loadTexture(textureImage)
  // create texture
  const cubeTexture = gl.createTexture()
  // bind exture
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  // link texture to image
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    cubeTextureImage
  )
  // unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null)

  // =========================================================
  // WORLD, PROJECTION, AND VIEW
  // =========================================================
  gl.useProgram(program)

  const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld') // added mWorld uniform to vertexShader as mat4 (4 number matrix)
  const matViewUniformLocation = gl.getUniformLocation(program, 'mView') // added mView uniform to vertexShader as mat4
  const matProjUniformLocation = gl.getUniformLocation(program, 'mProj') // added mProj uniform to vertexShader as mat4

  // added gl-matrix functions to calculate matrices (read gl-matrix docs for more info)
  const worldMatrix = new Float32Array(16)
  const viewMatrix = new Float32Array(16)
  const projMatrix = new Float32Array(16)
  mat4.identity(worldMatrix)
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0])
  mat4.perspective(
    projMatrix,
    glMatrix.toRadian(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  )

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix)
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix)

  // =========================================================
  // ROTATE WITH MOUSE
  // =========================================================

  const xRotationMatrix = new Float32Array(16)
  const yRotationMatrix = new Float32Array(16)

  const identityMatrix = new Float32Array(16)
  mat4.identity(identityMatrix)

  let isDown = false
  let angleX = 0
  let angleY = 0
  let speed = 50
  canvas.addEventListener(
    'mousedown',
    function (e) {
      e.preventDefault()
      isDown = true
    },
    true
  )
  canvas.addEventListener('mouseup', function (e) {
    e.preventDefault()
    isDown = false
  })
  canvas.addEventListener('mousemove', function (e) {
    e.preventDefault()
    if (isDown) {
      angleX = e.clientX
      angleY = e.clientY
    }
  })
  // =========================================================
  // LOOP
  // =========================================================
  const loop = () => {
    // ROTATE
    mat4.rotate(yRotationMatrix, identityMatrix, angleX / speed, [0, 1, 0])
    mat4.rotate(xRotationMatrix, identityMatrix, angleY / speed, [1, 0, 0])
    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix)
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)

    // CLEAR
    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    // TEXTURE
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture)
    gl.activeTexture(gl.TEXTURE0)

    // DRAW
    gl.drawElements(gl.TRIANGLES, cubeData.indices.length, gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

window.onload = App
