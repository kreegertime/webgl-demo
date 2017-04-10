const LATITUDE_BANDS = 30;
const LONGITUDE_BANDS = 30;
const RADIUS = 2;

const VERTEX_POSITION_DATA = [];
const NORMAL_DATA = [];
const TEXTURE_COORD_DATA = [];
const INDEX_DATA = [];

const NORMAL_DATA_SIZE = 3;
const TEXTURE_COORD_DATA_SIZE = 2;
const VERTEX_POSITION_DATA_SIZE = 3;
const INDEX_DATA_SIZE = 1;

for (let latNum = 0; latNum <= LATITUDE_BANDS; latNum++) {
  let theta = latNum * Math.PI / LATITUDE_BANDS;
  let sinTheta = Math.sin(theta);
  let cosTheta = Math.cos(theta);

  for (let longNum = 0; longNum <= LONGITUDE_BANDS; longNum++) {
    let phi = longNum * 2 * Math.PI / LONGITUDE_BANDS;
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);

    let x = cosPhi * sinTheta;
    let y = cosTheta;
    let z = sinPhi * sinTheta;
    let u = 1 - (longNum / LONGITUDE_BANDS);
    let v = 1 - (latNum / LATITUDE_BANDS);

    NORMAL_DATA.push(x);
    NORMAL_DATA.push(y);
    NORMAL_DATA.push(z);

    TEXTURE_COORD_DATA.push(u);
    TEXTURE_COORD_DATA.push(v);

    VERTEX_POSITION_DATA.push(RADIUS * x);
    VERTEX_POSITION_DATA.push(RADIUS * y);
    VERTEX_POSITION_DATA.push(RADIUS * z);
  }
}

for (let latNum = 0; latNum < LATITUDE_BANDS; latNum++) {
  for (let longNum = 0; longNum < LONGITUDE_BANDS; longNum++) {
    let first = (latNum * (LONGITUDE_BANDS + 1)) + longNum;
    let second = first + LONGITUDE_BANDS + 1;

    INDEX_DATA.push(first);
    INDEX_DATA.push(second);
    INDEX_DATA.push(first + 1);

    INDEX_DATA.push(second);
    INDEX_DATA.push(second + 1);
    INDEX_DATA.push(first + 1);
  }
}
