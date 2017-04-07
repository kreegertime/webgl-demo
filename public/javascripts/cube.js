const CUBE_VERTICES = [
  // Front face
  -1.0, -1.0,  1.0,
  1.0, -1.0,  1.0,
  1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
  1.0,  1.0,  1.0,
  1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
  1.0, -1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0,  1.0,  1.0,
  1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0
];

const CUBE_VERTEX_INDICES = [
  0, 1, 2,      0, 2, 3,    // Front face
  4, 5, 6,      4, 6, 7,    // Back face
  8, 9, 10,     8, 10, 11,  // Top face
  12, 13, 14,   12, 14, 15, // Bottom face
  16, 17, 18,   16, 18, 19, // Right face
  20, 21, 22,   20, 22, 23  // Left face
];

const _CUBE_COLORS = [
  [1.0, 0.0, 0.0, 1.0], // Front face
  [1.0, 1.0, 0.0, 1.0], // Back face
  [0.0, 1.0, 0.0, 1.0], // Top face
  [1.0, 0.5, 0.5, 1.0], // Bottom face
  [1.0, 0.0, 1.0, 1.0], // Right face
  [0.0, 0.0, 1.0, 1.0]  // Left face
];
let CUBE_COLORS = [];
for (var i in _CUBE_COLORS) {
  for (var j = 0; j < 4; j++) {
    CUBE_COLORS = CUBE_COLORS.concat(_CUBE_COLORS[i]);
  }
}

const CUBE_VERTICES_SIZE = 3;
const CUBE_VERTICES_ITEMS = 24;
const CUBE_VERTEX_INDICES_SIZE = 1;
const CUBE_VERTEX_INDICES_ITEMS = 36;
const CUBE_COLOR_SIZE = 4;
const CUBE_COLOR_ITEMS = 24;

