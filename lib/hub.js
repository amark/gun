const fs = require('fs');
const Gun = require('../index.js');

const gun = Gun();

let chokidar;

try { chokidar = require('chokidar') } catch {
  console.log('Type "npm i chokidar" if you want to use the hub feature !')
}

function watch(what, timeout) {
  timeout = timeout || 2000
  
  // Set up the file watcher !
  const watcher = chokidar.watch(what, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  
  const log = console.log.bind(console);
  
  // Handle events !
  
  watcher
    .on('add', async function(path) { 
      
      log(`File ${path} has been added`); 
      
      let container = gun.get(path).put({ 
        file: path, 
        content: fs.readFileSync(path, 'utf8') 
      })
      gun.get('hub').set(container).then(console.log('Done!'));
      
    })
    .on('change', async function(path) { 
    
      log(`File ${path} has been changed`);
      
      let container = gun.get(path).put({ 
        file: path, 
        content: fs.readFileSync(path, 'utf8') 
      }).then(console.log('Done!'))
    
    })
    .on('unlink', async function (path) { 
    
      log(`File ${path} has been removed`);  
      
      let container = gun.get(path).put({
        file: null,
        content: null,
        
      })
      
    })
    .on('addDir', path => log(`Directory ${path} has been added`))
    .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', () => log('Initial scan complete. Ready for changes'))

}

module.exports = { watch : watch, }