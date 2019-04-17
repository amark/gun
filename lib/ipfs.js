console.log("IPFS PLUGIN NOT OFFICIALLY MAINTAINED! PROBABLY WON'T WORK! USE AT YOUR OWN RISK! PLEASE CONTRIBUTE FIXES!");
var opt = gun._.opt, u;
if (u === opt.ipfs.directory) {
  opt.ipfs.directory = '/gun';
}
opt.store = {};
opt.store.put = function(file, data, cb){
  var uri = opt.ipfs.directory + '/' + file;
  opt.ipfs.instance.files.write(uri, Buffer.from(JSON.stringify(data)), {create:true})
  .then(res => {
    console.log('File written to IPFS directory', uri, res);
    return opt.ipfs.instance.files.stat(opt.ipfs.directory, {hash:true});
  }).then(res => {
    console.log('Directory hash:', res.hash);
    return opt.ipfs.instance.name.publish(res.hash);
    // currently throws "This command must be run in online mode. Try running 'ipfs daemon' first." for some reason, maybe js-ipfs IPNS not ready yet
  }).then(res => {
    console.log('IPFS put request successful:', res);
    cb(undefined, 1);
  }).catch(error => {
    console.error('IPFS put request failed', error);
  });
}
opt.store.get = function(file, cb){
    var uri = opt.ipfs.directory + '/' + file;
    opt.ipfs.instance.files.read(uri, {})
    .then(res => {
      var data = JSON.parse(res.toString());
      console.log(uri + ' was loaded from ipfs:', data);
      cb(data);
    });
}
opt.store.list = function(cb){
    var stream = opt.ipfs.files.lsReadableStream(opt.ipfs.directory);

    stream.on('data', (file) => {
      console.log('ls', file.name);
      if (cb(file.name)) {
        stream.destroy();
      }
    });

    stream.on('finish', () => {
      cb();
    });
}