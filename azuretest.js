var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

// load env file
var credsFile = path.join(__dirname, 'azurecreds.env');
if (fs.existsSync(credsFile)) {
  try {
    require('dotenv').config({ path: credsFile });
  } catch (e) {
    fs.readFileSync(credsFile, 'utf8').split('\n').forEach(function(line) {
      line = line.trim();
      if (!line || line[0] === '#') return;
      var i = line.indexOf('=');
      if (i === -1) return;
      var k = line.slice(0, i).trim();
      var v = line.slice(i + 1).trim();
      if ((v[0] === '"' && v.slice(-1) === '"') || (v[0] === "'" && v.slice(-1) === "'")) {
        v = v.slice(1, -1);
      }
      if (v && !process.env[k]) process.env[k] = v;
    });
  }
} else {
  try { require('dotenv').config(); } catch (e) {}
}

var AZURE_CONFIG = {
  accountName: process.env.AZURE_BLOB_ACCOUNT_NAME || '',
  accountKey: process.env.AZURE_BLOB_ACCOUNT_KEY || '',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  containerName: process.env.AZURE_BLOB_CONTAINER_NAME || process.env.AZURE_BLOB_CONTAINER || 'gun-azure-test'
};

var hasLiveCredentials = Boolean(
  AZURE_CONFIG.connectionString ||
  (AZURE_CONFIG.accountName && AZURE_CONFIG.accountKey)
);

var Gun = require('./index');
var AzureStore = require('./lib/azure');
var AzureDebug = require('./lib/azure-debug')(Gun);

function sha256(data) {
  var buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function createMockContainerClient(containerName) {
  var blobs = new Map();
  return {
    containerName: containerName,
    createIfNotExists: async function() { return { succeeded: true }; },
    exists: async function() { return true; },
    create: async function() { return { succeeded: true }; },
    getBlockBlobClient: function(name) {
      return {
        name: name,
        uploadData: async function(buf) {
          blobs.set(name, Buffer.from(buf));
          return { errorCode: undefined };
        },
        upload: async function(data) {
          blobs.set(name, Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'));
          return { errorCode: undefined };
        },
        downloadToBuffer: async function() {
          if (!blobs.has(name)) {
            var err = new Error('Blob not found');
            err.statusCode = 404;
            err.code = 'BlobNotFound';
            throw err;
          }
          return Buffer.from(blobs.get(name));
        },
        deleteIfExists: async function() {
          var ok = blobs.has(name);
          blobs.delete(name);
          return { succeeded: ok };
        },
        delete: async function() {
          if (!blobs.has(name)) {
            var err = new Error('Blob not found');
            err.statusCode = 404;
            throw err;
          }
          blobs.delete(name);
          return { succeeded: true };
        }
      };
    },
    listBlobsFlat: async function*(opt) {
      var prefix = (opt && opt.prefix) || '';
      for (var k of blobs.keys()) {
        if (!prefix || k.indexOf(prefix) === 0) {
          yield { name: k };
        }
      }
    }
  };
}

async function runTests() {
  var passed = 0, failed = 0;

  async function check(desc, fn) {
    try {
      await fn();
      console.log('ok - ' + desc);
      passed++;
    } catch (e) {
      console.error('not ok - ' + desc + ' (' + (e.message || e) + ')');
      failed++;
    }
  }

  console.log('Testing Gun Azure Adapter');
  console.log('Target container: ' + AZURE_CONFIG.containerName);
  console.log('Live credentials: ' + (hasLiveCredentials ? 'yes' : 'no (using mock)'));

  var testOpts;
  var mockClient;
  if (hasLiveCredentials) {
    testOpts = {
      azureBlob: {
        connectionString: AZURE_CONFIG.connectionString,
        accountName: AZURE_CONFIG.accountName,
        accountKey: AZURE_CONFIG.accountKey,
        containerName: AZURE_CONFIG.containerName
      },
      file: 'radata-test-' + Date.now(),
      newStore: true
    };
  } else {
    mockClient = createMockContainerClient(AZURE_CONFIG.containerName);
    testOpts = {
      azureBlob: {
        containerClient: mockClient,
        containerName: AZURE_CONFIG.containerName
      },
      file: 'radata-mock-' + Date.now(),
      newStore: true
    };
  }

  var store = AzureStore(testOpts);
  var containerClient = store.containerClient || mockClient;

  // 1. File write, read, and sha256 verification
  var testFile = 'gun_verified_' + Date.now() + '.json';
  var payload = JSON.stringify({
    timestamp: Date.now(),
    sample: crypto.randomBytes(128).toString('hex')
  }, null, 2);
  var expectedHash = sha256(payload);

  await check('put file to blob storage', async function() {
    return new Promise(function(resolve, reject) {
      store.put(testFile, payload, function(err, ok) {
        if (err) return reject(err);
        if (!ok) return reject(new Error('no ack'));
        resolve();
      });
    });
  });

  var downloaded;
  await check('get file back from blob storage', async function() {
    return new Promise(function(resolve, reject) {
      store.get(testFile, function(err, data) {
        if (err) return reject(err);
        downloaded = data;
        resolve();
      });
    });
  });

  await check('verify file hash integrity matches bit-for-bit', async function() {
    var actualHash = sha256(downloaded);
    if (expectedHash !== actualHash) {
      throw new Error('Hash mismatch: expected ' + expectedHash + ', got ' + actualHash);
    }
    console.log('     sha256: ' + actualHash + ' (' + testFile + ')');
  });

  // 2. Direct raw download via azure SDK to verify remote blob
  await check('direct azure client raw download', async function() {
    var raw = await containerClient.getBlockBlobClient(testFile).downloadToBuffer();
    if (sha256(raw) !== expectedHash) {
      throw new Error('Raw blob content hash mismatch');
    }
  });

  // 3. Non-existent file handling
  await check('get non-existent file returns undefined', async function() {
    return new Promise(function(resolve, reject) {
      store.get('missing_' + Date.now(), function(err, data) {
        if (err) return reject(err);
        if (data !== undefined) return reject(new Error('expected undefined for missing file'));
        resolve();
      });
    });
  });

  // 4. List blobs
  await check('list blobs in container', async function() {
    return new Promise(function(resolve, reject) {
      var files = [];
      store.list(function(file) {
        if (file) {
          files.push(file);
        } else {
          if (files.indexOf(testFile) === -1) {
            return reject(new Error('uploaded file missing from list'));
          }
          resolve();
        }
      });
    });
  });

  // 5. Azure debug chain API
  var debugAz = AzureDebug({
    containerClient: hasLiveCredentials ? undefined : containerClient,
    connectionString: AZURE_CONFIG.connectionString,
    accountName: AZURE_CONFIG.accountName,
    accountKey: AZURE_CONFIG.accountKey,
    containerName: AZURE_CONFIG.containerName
  });

  var debugKey = 'debug_' + Date.now() + '.json';
  var debugPayload = { msg: 'ping', num: 42 };

  await check('azure-debug PUT and GET', async function() {
    await new Promise(function(resolve, reject) {
      debugAz.PUT(debugKey, debugPayload, function(err, res) {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise(function(resolve, reject) {
      debugAz.GET(debugKey, function(err, data) {
        if (err) return reject(err);
        if (!data || data.num !== 42) return reject(new Error('data mismatch'));
        resolve();
      });
    });
  });

  // 6. Gun integration put and get
  await check('gun put and get graph node persisted in azure', async function() {
    return new Promise(function(resolve, reject) {
      var timeout = setTimeout(function() {
        reject(new Error('timeout'));
      }, 8000);

      var gun = Gun({
        azureBlob: {
          connectionString: AZURE_CONFIG.connectionString,
          accountName: AZURE_CONFIG.accountName,
          accountKey: AZURE_CONFIG.accountKey,
          containerName: AZURE_CONFIG.containerName,
          containerClient: hasLiveCredentials ? undefined : containerClient,
          prefix: 'gun-graph/'
        },
        radisk: true,
        web: null,
        multicast: false,
        file: 'radata-gun-' + Date.now(),
        newStore: true
      });

      var soul = 'test_soul_' + Date.now();
      var val = 'azure_val_' + Date.now();

      gun.get(soul).put({ val: val }, function(ack) {
        if (ack.err) {
          clearTimeout(timeout);
          return reject(new Error(ack.err));
        }

        gun.get(soul).once(function(data) {
          clearTimeout(timeout);
          if (!data || data.val !== val) {
            return reject(new Error('gun get did not return expected value'));
          }
          resolve();
        });
      });
    });
  });

  // Print summary of blobs currently in container
  var containerBlobs = [];
  await new Promise(function(resolve) {
    store.list(function(name) {
      if (name) containerBlobs.push(name);
      else resolve();
    });
  });

  console.log('\nBlobs in container (' + containerBlobs.length + '):');
  containerBlobs.slice(-8).forEach(function(b) {
    console.log(' - ' + b);
  });
  if (containerBlobs.length > 8) {
    console.log(' ... (' + (containerBlobs.length - 8) + ' older blobs)');
  }

  console.log('\nTests completed: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
}

module.exports = {
  AZURE_CONFIG: AZURE_CONFIG,
  createMockContainerClient: createMockContainerClient,
  hasLiveCredentials: hasLiveCredentials
};

if (require.main === module) {
  runTests().catch(function(err) {
    console.error(err);
    process.exit(1);
  });
}
