function _point(x, y) {
  this.x = x;
  this.y = y;
}
function Point(x, y) {
  return new _point(x, y);
}
