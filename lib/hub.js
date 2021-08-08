const fs = require('fs');
const Gun = require('../index.js');

const gun = Gun();

let chokidar;

try { chokidar = require('chokidar') } catch (error) {
} // Must install chokidar to use this feature.

function watch(what, opt) {
  opt = opt || { }
  
  let modifiedPath = (opt.file || "");
  
  let watcher; 
  try {
    // Set up the file watcher. 
    watcher = chokidar.watch(what, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });
    
    const log = console.log.bind(console);
    
    // Handle events !
    watcher
      .on('add', async function(path) { 
        
        log(`File ${path} has been added`); 
        gun.get('hub').get(modifiedPath + '/' + path).put(fs.readFileSync(path, 'utf-8'))
     
      })
      .on('change', async function(path) { 
    
        log(`File ${path} has been changed`);
        gun.get('hub').get(modifiedPath + '/' + path).put(fs.readFileSync(path, 'utf-8'))

      })
      .on('unlink', async function (path) { 
    
        log(`File ${path} has been removed`);  
        gun.get('hub').get(modifiedPath + '/' + path).put(null)
      
      })
      .on('addDir', path => log(`Directory ${path} has been added`))
      .on('unlinkDir', path => log(`Directory ${path} has been removed`))
      .on('error', error => log(`Watcher error: ${error}`))
      .on('ready', () => log('Initial scan complete. Ready for changes'))

  } catch (err) {
    console.log('If you want to use the hub feature, you must install `chokidar` by typing `npm i chokidar` in your terminal.')
  }
}

gun.get('hub').on(data => {
  console.log(data);
})

module.exports = { watch : watch, }
