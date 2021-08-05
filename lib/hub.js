const fs = require('fs');
const Gun = require('../index.js');

const gun = Gun();

let chokidar;

try { chokidar = require('chokidar') } catch (error) {
  console.log('Type "npm i chokidar" if you want to use the hub feature !')
} // Must install chokidar to use this feature.

function watch(what) {
  let watcher;
  try {
    // Set up the file watcher !
    watcher = chokidar.watch(what, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });
  } catch (err) {
    console.err(`If you want to use this feature, type 'npm i chokidar' !`)
  }
  
  const log = console.log.bind(console);
  
  // Handle events !
  
  watcher
    .on('add', async function(path) { 
      
      log(`File ${path} has been added`); 
      gun.get('hub').get(process.cwd() + '/' + path).put(fs.readFileSync(path, 'utf8')).then(console.log('Done!'));
      
    })
    .on('change', async function(path) { 
    
      log(`File ${path} has been changed`);
      gun.get('hub').get(process.cwd() + '/' + path).put(fs.readFileSync(path, 'utf8')).then(console.log('Done!'));
    
    })
    .on('unlink', async function (path) { 
    
      log(`File ${path} has been removed`);  
      
      gun.get('hub').get(process.cwd() + '/' + path).put(null);

      
    })
    .on('addDir', path => log(`Directory ${path} has been added`))
    .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', () => log('Initial scan complete. Ready for changes'))

}

gun.get('hub').on(data => {
  console.log(data);
})

module.exports = { watch : watch, }