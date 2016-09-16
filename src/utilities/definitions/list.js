/**
 * Created by Paul on 9/8/2016.
 */

let List = {
  is: function (l) {
    return (l instanceof Array);
  }
};

List.slit = Array.prototype.slice;

List.sort = function (k) { // creates a new sort function based off some field
  return function (A, B) {
    if (!A || !B) {
      return 0;
    }
    A = A[k];
    B = B[k];
    if (A < B) {
      return -1;
    } else if (A > B) {
      return 1;
    }
    else {
      return 0;
    }
  }
};

List.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation

export default List;
