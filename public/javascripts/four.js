const VERTEX_SHADER_SRC =
    'attribute vec3 aVertexPosition;' +
    'attribute vec4 aVertexColor;' +
    'uniform mat4 uMVMatrix;' +
    'uniform mat4 uPMatrix;' +
    'varying vec4 vColor;' +
    'void main(void) {' +
      'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);' +
      'vColor = aVertexColor;' +
    '}';

const FRAGMENT_SHADER_SRC =
    'precision mediump float;' +
    'varying vec4 vColor;' +
    'void main(void) {' +
      'gl_FragColor = vColor;' +
    '}';


let gl;
let shaderProgram;
let mvMatrix = mat4.create();
let mvMatrixStack = [];
let pMatrix = mat4.create();

let pyramidVertexPositionBuffer;
let pyramidVertexColorBuffer;

let cubeVertexPositionBuffer;
let cubeVertexColorBuffer;
let cubeVertexIndexBuffer;

let lastTime = 0;
let rPyramid = 0;
let rCube = 0;


function mvPushMatrix() {
  let copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}


function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw 'Invalid popMatrix!';
  }
  mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function initShaders() {
  let fragmentShader = createFragmentShader(FRAGMENT_SHADER_SRC);
  let vertexShader = createVertexShader(VERTEX_SHADER_SRC);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, fragmentShader);
  gl.attachShader(shaderProgram, vertexShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw 'Could not init shaders!';
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
}


function initBuffers() {
  pyramidVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(PYRAMID_VERTICES), gl.STATIC_DRAW);

  pyramidVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(PYRAMID_COLORS), gl.STATIC_DRAW);

  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CUBE_VERTICES), gl.STATIC_DRAW);

  cubeVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CUBE_COLORS), gl.STATIC_DRAW);

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CUBE_VERTEX_INDICES), gl.STATIC_DRAW);
}


function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  // Draw pyramid
  mat4.translate(mvMatrix, [-1.5, 0.0, -8.0]);
  mvPushMatrix();
  mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
  gl.vertexAttribPointer(
      shaderProgram.vertexPositionAttribute,
      PYRAMID_VERTICES_SIZE,
      gl.FLOAT,
      false,
      0,
      0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
  gl.vertexAttribPointer(
      shaderProgram.vertexColorAttribute,
      PYRAMID_COLOR_SIZE,
      gl.FLOAT,
      false,
      0,
      0);

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, PYRAMID_VERTICES_ITEMS);
  mvPopMatrix();

  // Draw cube
  mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
  mvPushMatrix();
  mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(
      shaderProgram.vertexPositionAttribute,
      CUBE_VERTICES_SIZE,
      gl.FLOAT,
      false,
      0,
      0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
  gl.vertexAttribPointer(
      shaderProgram.vertexColorAttribute,
      CUBE_COLOR_SIZE,
      gl.FLOAT,
      false,
      0,
      0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, CUBE_VERTEX_INDICES_ITEMS, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix();
}


function animate() {
  let timeNow = new Date().getTime();
  if (lastTime != 0) {
    let elapsed = timeNow - lastTime;
    rPyramid += (90 * elapsed) / 1000.0;
    rCube -= (75 * elapsed) / 1000.0;
  }
  lastTime = timeNow;
}


function tick() {
  requestAnimFrame(tick);
  drawScene();
  animate();
}


function loadWebGL() {
  gl = initWebGL('four-canvas');

  initShaders();
  initBuffers();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  tick();
}

