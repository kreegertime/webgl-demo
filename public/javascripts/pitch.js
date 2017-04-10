const VERTEX_SHADER_SRC =
    'attribute vec3 aVertexPosition;' +
    'attribute vec3 aVertexNormal;' +
    'attribute vec2 aTextureCoord;' +

    'uniform mat4 uMVMatrix;' +
    'uniform mat4 uPMatrix;' +
    'uniform mat3 uNMatrix;' +

    'uniform vec3 uAmbientColor;' +

    'uniform vec3 uLightingDirection;' +
    'uniform vec3 uDirectionalColor;' +

    'uniform bool uUseLighting;' +

    'varying vec2 vTextureCoord;' +
    'varying vec3 vLightWeighting;' +

    'void main(void) {' +
      'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);' +
      'vTextureCoord = aTextureCoord;' +

      'if (!uUseLighting) {' +
        'vLightWeighting = vec3(1.0, 1.0, 1.0);' +
      '} else {' +
        'vec3 transformedNormal = uNMatrix * aVertexNormal;' +
        'float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);' +
        'vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;' +
      '}' +
    '}';

const FRAGMENT_SHADER_SRC =
    'precision mediump float;' +

    'varying vec2 vTextureCoord;' +
    'varying vec3 vLightWeighting;' +

    'uniform sampler2D uSampler;' +

    'void main(void) {' +
      'vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));' +
      'gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);' +
    '}';


let gl;

let shaderProgram;
let vertexPositionAttribute;
let textureCoordAttribute;

let mvMatrix = mat4.create();
let mvMatrixStack = [];
let pMatrix = mat4.create();

let pMatrixUniform;
let mvMatrixUniform;
let nMatrixUniform;
let samplerUniform;
let useLightingUniform;
let ambientColorUniform;
let lightingDirectionUniform;
let directionalColorUniform;

let ballVertexPositionBuffer;
let ballVertexNormalBuffer;
let ballVertexTextureCoordBuffer;
let ballVertexIndexBuffer;

let ballTexture;

let ballRotationMatrix;
let lastTime = 0;

let ballX = 0;
let ballY = 10;
let ballZ = -100;
let ballDegRot = 25;


function loadWebGL() {
  gl = initWebGL('webgl-canvas');

  let canvas = document.getElementById('webgl-canvas');

  ballRotationMatrix = mat4.create();
  mat4.identity(ballRotationMatrix);

  initShaders();
  initBuffers();
  initTexture(() => {
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
  });
}


function initShaders() {
  shaderProgram = initShaderProgram(gl, FRAGMENT_SHADER_SRC, VERTEX_SHADER_SRC);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPositionAttribute);

  textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.enableVertexAttribArray(textureCoordAttribute);

  vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  gl.enableVertexAttribArray(vertexNormalAttribute);

  pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNMatrix');
  samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
  useLightingUniform = gl.getUniformLocation(shaderProgram, 'uUseLighting');
  ambientColorUniform = gl.getUniformLocation(shaderProgram, 'uAmbientColor');
  lightingDirectionUniform = gl.getUniformLocation(shaderProgram, 'uLightingDirection');
  directionalColorUniform = gl.getUniformLocation(shaderProgram, 'uDirectionalColor');
}


function initBuffers() {
  ballVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(NORMAL_DATA), gl.STATIC_DRAW);

  ballVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(TEXTURE_COORD_DATA), gl.STATIC_DRAW);

  ballVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTEX_POSITION_DATA), gl.STATIC_DRAW);

  ballVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(INDEX_DATA), gl.STATIC_DRAW);
}


function initTexture(callback) {
  ballTexture = gl.createTexture();
  ballTexture.image = new Image();
  ballTexture.image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, ballTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ballTexture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    callback();
  };
  ballTexture.image.src = 'images/baseball2.png';
}


function setMatrixUniforms() {
  gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);

  let normalMatrix = mat3.create();
  mat4.toInverseMat3(mvMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  gl.uniformMatrix3fv(nMatrixUniform, false, normalMatrix);
}


function tick() {
  requestAnimFrame(tick);
  drawScene();
  animate();
}


function animate() {
  let timeNow = new Date().getTime();
  if (lastTime != 0) {
    let elapsed = timeNow - lastTime;
    mat4.rotate(ballRotationMatrix, degToRad(ballDegRot), [1, 2, 1]);
    ballX += 0.01;
    ballY -= 0.1;
    ballZ += 0.5;

    if (ballZ > 0) {
      ballX = 0;
      ballY = 10;
      ballZ = -100;
    }
  }
  lastTime = timeNow;
}


function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  let useLighting = true;
  gl.uniform1i(useLightingUniform, useLighting);
  if (useLighting) {
    gl.uniform3f(ambientColorUniform, 0.2, 0.2, 0.2);

    let lightingDirection = [-1.0, -1.0, -1.0];
    let adjustedLD = vec3.create();
    vec3.normalize(lightingDirection, adjustedLD);
    vec3.scale(adjustedLD, -1);
    gl.uniform3fv(lightingDirectionUniform, adjustedLD);

    gl.uniform3f(directionalColorUniform, 0.8, 0.8, 0.8);
  }

  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [ballX, ballY, ballZ]);

  mat4.multiply(mvMatrix, ballRotationMatrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, ballTexture);
  gl.uniform1i(samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexPositionBuffer);
  gl.vertexAttribPointer(
      vertexPositionAttribute, VERTEX_POSITION_DATA_SIZE, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexTextureCoordBuffer);
  gl.vertexAttribPointer(
      textureCoordAttribute, TEXTURE_COORD_DATA_SIZE, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexNormalBuffer);
  gl.vertexAttribPointer(
      vertexNormalAttribute, NORMAL_DATA_SIZE, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, INDEX_DATA.length, gl.UNSIGNED_SHORT, 0);
}
