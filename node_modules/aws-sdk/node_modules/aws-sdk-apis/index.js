var fs = require('fs');

var apiRoot = __dirname + '/apis';
var serviceMap = null;
var serviceIdentifiers = [];
var serviceNames = [];

function buildServiceMap() {
  if (serviceMap !== null) return;

  // load symlinks file for API versions that have been removed from disk but
  // are still referenceable in code.
  var symlinksFile = apiRoot + '/symlinks.json';
  var symlinks = JSON.parse(fs.readFileSync(symlinksFile).toString());

  // create a map of each service name to its list of versions
  serviceMap = {};
  fs.readdirSync(apiRoot).forEach(function (file) {
    var match = file.match(/^([^-]+)-(\d+-\d+-\d+)\.json$/);
    if (match) {
      var svcName = match[1], version = match[2];
      var svcIdentifier = svcName.toLowerCase();

      if (!serviceMap[svcIdentifier]) { // build the base service values
        // add versions from symlinks, if any
        var versions = symlinks[svcName] || [];
        serviceMap[svcIdentifier] = { name: svcName, versions: versions };
      }

      serviceMap[svcIdentifier].versions.push(version);
    }
  });

  Object.keys(serviceMap).forEach(function(identifier) {
    serviceMap[identifier].versions = serviceMap[identifier].versions.sort();
    serviceIdentifiers.push(identifier);
    serviceNames.push(serviceMap[identifier].name);
  });
}

function getServices() {
  buildServiceMap();
  return serviceIdentifiers;
}

function getServiceNames() {
  buildServiceMap();
  return serviceNames;
}

function serviceVersions(svc) {
  buildServiceMap();
  svc = serviceIdentifier(svc);
  return serviceMap[svc] ? serviceMap[svc].versions : null;
}

function serviceName(svc) {
  buildServiceMap();
  svc = serviceIdentifier(svc);
  return serviceMap[svc] ? serviceMap[svc].name : null;
}

function serviceFile(svc, version) {
  buildServiceMap();
  svc = serviceIdentifier(svc);
  if (!serviceMap[svc]) return null;

  return apiRoot + '/' + serviceMap[svc].name + '-' + version + '.json';
}

function serviceIdentifier(svc) {
  return svc.toLowerCase();
}

module.exports = {
  serviceVersions: serviceVersions,
  serviceName: serviceName,
  serviceIdentifier: serviceIdentifier,
  serviceFile: serviceFile
};
Object.defineProperty(module.exports, 'services', {
  enumerable: true, get: getServices
});
Object.defineProperty(module.exports, 'serviceNames', {
  enumerable: true, get: getServiceNames
});
