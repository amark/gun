var Radisk = require('../../lib/radisk.js');
var Radix = require('../../lib/radix.js');

// Mock options
var opt = {
  file: 'radata_test_split_failure',
  chunk: 10, // Very small chunk to force split
  store: {
    get: function (file, cb) {
      cb(null, null);
    },
    put: function (file, data, cb) {
      cb(null, 'ok');
    },
  },
  log: function () {}, // Silence logs
};

var r = Radisk(opt);

// Construct a radix tree that needs splitting
// Key size + value size + overhead > 10
// Entry: len#key:val\n
// 3#key:val\n -> ~10 chars
var tree = Radix();
// Add enough keys to ensure split happens (need > 1 key)
for (var i = 10; i < 20; i++) {
  tree('k' + i, 'val' + i);
}
// tree file
tree.file = 'root_file';

console.log('--- TEST: Split Failure Safety ---');

var putCalls = [];
opt.store.put = function (file, data, cb) {
  putCalls.push(file);
  console.log('Store.put called for:', file);

  if (file === 'root_file') {
    // This is the old file being overwritten/truncated
    cb(null, 'ok');
  } else {
    // This is the new split file
    console.log('Simulating FAILURE for new file:', file);
    cb('MockWriteError');
  }
};

r.write('root_file', tree, function (err, ok) {
  console.log('Callback received:', err);

  // Check results
  var newFileCalls = putCalls.filter(function (f) {
    return f !== 'root_file';
  });
  var oldFileCalls = putCalls.filter(function (f) {
    return f === 'root_file';
  });

  if (newFileCalls.length === 0) {
    console.log('FAILURE: Did not attempt to write new file (Did not split?)');
  } else if (oldFileCalls.length > 0) {
    console.log(
      'FAILURE: Old file was written despite new file failure! DATA LOSS RISK.',
    );
    console.log('Writes:', putCalls);
  } else {
    console.log(
      'SUCCESS: Old file was NOT written after new file failure. Data is safe.',
    );
  }
});
