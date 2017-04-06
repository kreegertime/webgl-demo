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

