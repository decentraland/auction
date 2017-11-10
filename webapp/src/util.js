export function buildCoordinate(x, y) {
  return `${x},${y}`;
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
