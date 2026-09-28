var http = require('http');
var fs = require('fs');
var path = require('path');

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

var Gun = require('./index');
require('./lib/azure');

var port = process.env.PORT || process.argv[2] || 8765;
var peers = process.env.PEERS ? process.env.PEERS.split(',').map(function(p){ return p.trim(); }) : [];

var server = http.createServer(function(req, res) {
  if (req.url === '/health' || req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }

  if (typeof Gun.serve === 'function') {
    return Gun.serve(__dirname)(req, res);
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Gun relay running\n');
});

var azureConfig = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountName: process.env.AZURE_BLOB_ACCOUNT_NAME,
  accountKey: process.env.AZURE_BLOB_ACCOUNT_KEY,
  containerName: process.env.AZURE_BLOB_CONTAINER_NAME || 'gun-data',
  prefix: process.env.AZURE_BLOB_PREFIX || 'radata/'
};

var gun = Gun({
  web: server.listen(port, function() {
    console.log('Gun relay started on port ' + port + ' with /gun');
    console.log('Azure container: ' + azureConfig.containerName);
  }),
  peers: peers,
  azureBlob: azureConfig,
  radisk: true,
  file: 'radata'
});

function shutdown() {
  server.close(function() {
    process.exit(0);
  });
  setTimeout(function() {
    process.exit(0);
  }, 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { gun: gun, server: server };
