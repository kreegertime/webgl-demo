function _createShader(type, shaderSrc) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, shaderSrc);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}


function createFragmentShader(shaderSrc) {
  return _createShader(gl.FRAGMENT_SHADER, shaderSrc);
}


function createVertexShader(shaderSrc) {
  return _createShader(gl.VERTEX_SHADER, shaderSrc);
}


function initWebGL(elementId) {
  // TODO(kreeger): It this the correct context name?
  let element = document.getElementById(elementId);
  if (!element) {
    throw 'Could not find element';
  }
  let gl = element.getContext('experimental-webgl');
  gl.viewportWidth = element.width;
  gl.viewportHeight = element.height;
  return gl;
}

function initShaderProgram(gl, fragmentShaderSrc, vertexShaderSrc) {
  let fragmentShader = createFragmentShader(fragmentShaderSrc);
  let vertexShader = createVertexShader(vertexShaderSrc);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, fragmentShader);
  gl.attachShader(shaderProgram, vertexShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw 'Could not init shaders!';
  }

  gl.useProgram(shaderProgram);
  return shaderProgram;
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

