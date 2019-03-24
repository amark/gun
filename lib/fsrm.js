var fs = require('fs');
var nodePath = require('path');

var dir = __dirname + '/../';

module.exports = function rm(path, full) {
	path = full || nodePath.join(dir, path);
  if(!fs.existsSync(path)){ return }
  fs.readdirSync(path).forEach(function(file,index){
    var curPath = path + "/" + file;
    if(fs.lstatSync(curPath).isDirectory()) { // recurse
      rm(null, curPath);
    } else { // delete file
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(path);
};