const VERTEX_SHADER_SRC =
    'attribute vec3 aVertexPosition;' +
    'attribute vec2 aTextureCoord;' +

    'uniform mat4 uMVMatrix;' +
    'uniform mat4 uPMatrix;' +

    'varying vec2 vTextureCoord;' +

    'void main(void) {' +
      'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);' +
      'vTextureCoord = aTextureCoord;' +
    '}';

const FRAGMENT_SHADER_SRC =
    'precision mediump float;' +

    'varying vec2 vTextureCoord;' +

    'uniform sampler2D uSampler;' +

    'void main(void) {' +
      'gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));' +
    '}';


let gl;
let shaderProgram;
let mvMatrix = mat4.create();
let mvMatrixStack = [];
let pMatrix = mat4.create();
let vertexPositionAttribute;
let textureCoordAttribute;
let pMatrixUniform;
let mvMatrixUniform;
let samplerUniform;

let cubeVertexPositionBuffer;
let cubeVertexTextureCoordBuffer;
let cubeVertexIndexBuffer;

let texture;

let lastTime = 0;
let xRot = 0;
let yRot = 0;
let zRot = 0;


function setMatrixUniforms() {
  gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
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

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPositionAttribute);

  textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.enableVertexAttribArray(textureCoordAttribute);

  pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
}


function initBuffers() {
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CUBE_VERTICES), gl.STATIC_DRAW);

  cubeVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CUBE_TEXTURE_COORDS), gl.STATIC_DRAW);

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CUBE_VERTEX_INDICES), gl.STATIC_DRAW);
}


function initTexture(callback) {
  texture = gl.createTexture();
  texture.image = new Image();
  texture.image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    callback();
  };

  texture.image.src = 'images/frank1.png';
  //texture.image.src = 'images/nehe.gif';
}


function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

  mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);
  mat4.rotate(mvMatrix, degToRad(zRot), [0, 0, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(
      vertexPositionAttribute, CUBE_VERTICES_SIZE, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(
      textureCoordAttribute, CUBE_TEXTURE_COORDS_SIZE, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(samplerUniform, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, CUBE_VERTEX_INDICES_ITEMS, gl.UNSIGNED_SHORT, 0);
}


function animate() {
  let timeNow = new Date().getTime();
  if (lastTime != 0) {
    let elapsed = timeNow - lastTime;
    xRot += (90 * elapsed) / 1000.0;
    yRot += (90 * elapsed) / 1000.0;
    zRot += (90 * elapsed) / 1000.0;
  }
  lastTime = timeNow;
}


function tick() {
  requestAnimFrame(tick);
  drawScene();
  animate();
}


function loadWebGL() {
  gl = initWebGL('webgl-canvas');

  initShaders();
  initBuffers();
  initTexture(() => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
  });
}

