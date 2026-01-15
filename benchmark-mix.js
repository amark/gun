// Benchmark: .push() vs direct index assignment
// This validates the mix() function optimization

var iterations = 1000000;
var warmup = 10000;

// Simulate the mix function behavior
function mixOld(from, limbo) {
  var j = 0, i;
  while (i = limbo[j++]) {
    from.push(i); // old way
  }
  return from;
}

function mixNew(from, limbo) {
  var j = 0, k = from.length, i;
  while (i = limbo[j++]) {
    from[k++] = i; // new way - direct index assignment
  }
  return from;
}

// Create test data
function createLimbo(size) {
  var arr = [];
  for (var i = 0; i < size; i++) {
    arr[i] = { word: 'item' + i, is: i };
  }
  return arr;
}

// Warmup
for (var w = 0; w < warmup; w++) {
  mixOld([], createLimbo(10));
  mixNew([], createLimbo(10));
}

// Benchmark .push()
var limbo = createLimbo(iterations);
var from = [];
var start = Date.now();
mixOld(from, limbo);
var pushTime = Date.now() - start;

// Benchmark direct index
limbo = createLimbo(iterations);
from = [];
start = Date.now();
mixNew(from, limbo);
var indexTime = Date.now() - start;

console.log('=== mix() Performance Benchmark ===');
console.log('Iterations:', iterations.toLocaleString());
console.log('');
console.log('.push() method:         ', pushTime, 'ms');
console.log('Direct index assignment:', indexTime, 'ms');
console.log('');
console.log('Speedup:', (pushTime / indexTime).toFixed(2) + 'x faster');
