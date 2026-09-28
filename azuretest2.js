var http = require('http');
var url = require('url');

var creds = require('./azuretest');
var AZURE_CONFIG = creds.AZURE_CONFIG;
var hasLiveCredentials = creds.hasLiveCredentials;
var createMockContainerClient = creds.createMockContainerClient;

var Gun = require('./index');
var AzureStore = require('./lib/azure');

var PORT = process.env.PORT || process.argv[2] || 8765;

var azureBlobOptions;
if (hasLiveCredentials) {
  azureBlobOptions = {
    connectionString: AZURE_CONFIG.connectionString,
    accountName: AZURE_CONFIG.accountName,
    accountKey: AZURE_CONFIG.accountKey,
    containerName: AZURE_CONFIG.containerName
  };
} else {
  azureBlobOptions = {
    containerClient: createMockContainerClient(AZURE_CONFIG.containerName),
    containerName: AZURE_CONFIG.containerName
  };
}

var azureStore = AzureStore({
  azureBlob: azureBlobOptions,
  file: 'radata-http'
});

function renderHtml() {
  return '<!DOCTYPE html>\n' +
  '<html>\n' +
  '<head>\n' +
  '  <meta charset="utf-8">\n' +
  '  <title>Gun + Azure Test</title>\n' +
  '  <style>\n' +
  '    body { font-family: sans-serif; max-width: 800px; margin: 30px auto; padding: 0 15px; }\n' +
  '    input, button { padding: 6px 10px; margin: 4px 0; }\n' +
  '    pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }\n' +
  '    .box { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 4px; }\n' +
  '  </style>\n' +
  '</head>\n' +
  '<body>\n' +
  '  <h2>Gun + Azure Blob Storage Test</h2>\n' +
  '  <p>Container: <strong>' + AZURE_CONFIG.containerName + '</strong> (' + (hasLiveCredentials ? 'live' : 'mock') + ')</p>\n' +
  '  <div class="box">\n' +
  '    <h3>Write (PUT)</h3>\n' +
  '    <input id="putKey" value="demoKey" placeholder="key" /><br/>\n' +
  '    <input id="putVal" value="hello world" placeholder="value" /><br/>\n' +
  '    <button onclick="putData()">Save to Gun</button>\n' +
  '  </div>\n' +
  '  <div class="box">\n' +
  '    <h3>Read (GET)</h3>\n' +
  '    <input id="getKey" value="demoKey" placeholder="key" /><br/>\n' +
  '    <button onclick="getData()">Load from Gun</button>\n' +
  '    <pre id="output">Result will appear here</pre>\n' +
  '  </div>\n' +
  '  <div class="box">\n' +
  '    <h3>Blobs in Container</h3>\n' +
  '    <button onclick="loadBlobs()">Refresh Blobs</button>\n' +
  '    <pre id="blobs">Loading...</pre>\n' +
  '  </div>\n' +
  '  <script src="/gun.js"></script>\n' +
  '  <script>\n' +
  '    var gun = Gun(location.origin + "/gun");\n' +
  '    function putData(){\n' +
  '      var k = document.getElementById("putKey").value;\n' +
  '      var v = document.getElementById("putVal").value;\n' +
  '      gun.get(k).put(v, function(ack){\n' +
  '        document.getElementById("output").textContent = "Saved: " + JSON.stringify(ack);\n' +
  '        loadBlobs();\n' +
  '      });\n' +
  '    }\n' +
  '    function getData(){\n' +
  '      var k = document.getElementById("getKey").value;\n' +
  '      gun.get(k).once(function(data){\n' +
  '        document.getElementById("output").textContent = JSON.stringify(data, null, 2);\n' +
  '      });\n' +
  '    }\n' +
  '    function loadBlobs(){\n' +
  '      fetch("/api/list").then(function(r){ return r.json() }).then(function(d){\n' +
  '        document.getElementById("blobs").textContent = JSON.stringify(d.blobs, null, 2);\n' +
  '      });\n' +
  '    }\n' +
  '    loadBlobs();\n' +
  '  </script>\n' +
  '</body>\n' +
  '</html>';
}

var server = http.createServer(function(req, res) {
  var parsed = url.parse(req.url, true);
  var pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderHtml());
  }

  if (pathname === '/api/list') {
    var blobs = [];
    azureStore.list(function(name) {
      if (name) {
        blobs.push(name);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ container: AZURE_CONFIG.containerName, blobs: blobs }));
      }
    });
    return;
  }

  if (pathname === '/api/get') {
    var key = parsed.query.key;
    if (!key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'missing key parameter' }));
    }
    gun.get(key).once(function(data) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ key: key, data: data }));
    });
    return;
  }

  if (pathname === '/api/put' && req.method === 'POST') {
    var body = '';
    req.on('data', function(c) { body += c; });
    req.on('end', function() {
      try {
        var json = JSON.parse(body);
        gun.get(json.key).put(json.value, function(ack) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, ack: ack }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (typeof Gun.serve === 'function') {
    Gun.serve(__dirname)(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

var gun = Gun({
  web: server.listen(PORT, function() {
    console.log('Gun server running on port ' + PORT + ' (azure container: ' + AZURE_CONFIG.containerName + ')');
  }),
  azureBlob: azureBlobOptions,
  radisk: true,
  file: 'radata-http'
});

module.exports = { server: server, gun: gun };
