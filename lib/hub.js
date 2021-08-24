const fs = require('fs');
const Gun = require('../index.js');

const gun = Gun();

let chokidar;

try { chokidar = require('chokidar') } catch (error) {
} // Must install chokidar to use this feature.

/**
 * Watches a directory and send all its content in the database
 * @constructor
 * @param {string} what - Which directory hub should watch.
 * @param {Object} options - https://gun.eco/docs/hub.js#options
 */
function watch(what, options) {
  options = options || { msg: true }
  
  let modifiedPath = (options.file || "");
  
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
        if (options.msg) log(`File ${path} has been added`);
        gun.get('hub').get(modifiedPath + '/' + path).put(fs.readFileSync(path, 'utf-8'))
     
      })
      .on('change', async function(path) { 
    
        if (options.msg) log(`File ${path} has been changed`);
        gun.get('hub').get(modifiedPath + '/' + path).put(fs.readFileSync(path, 'utf-8'))

      })
      .on('unlink', async function (path) { 
    
        if(options.msg) log(`File ${path} has been removed`);  
        gun.get('hub').get(modifiedPath + '/' + path).put(null)
      
      })
      if (options.msg) {
        watcher
        .on('addDir', path => log(`Directory ${path} has been added`))
        .on('unlinkDir', path => log(`Directory ${path} has been removed`))
        .on('error', error => log(`Watcher error: ${error}`))
        .on('ready', () => log('Initial scan complete. Ready for changes'))
      }

  } catch (err) {
    console.log('If you want to use the hub feature, you must install `chokidar` by typing `npm i chokidar` in your terminal.')
  }
}

module.exports = { watch : watch }