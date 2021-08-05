const fs = require('fs');
const Gun = require('../index.js');

const gun = Gun();

let chokidar;

try { chokidar = require('chokidar') } catch (error) {
  console.log('Type "npm i chokidar" if you want to use the hub feature !')
} // Must install chokidar to use this feature.

function watch(what) {
  
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
      gun.get('hub').get(path).put({ 

        file: path, // Add the path to the file.
        content: fs.readFileSync(path, 'utf8') // Add the content of the file 

      }).then(console.log('Done!'));
      
    })
    .on('change', async function(path) { 
    
      log(`File ${path} has been changed`);
      
      gun.get('hub').get(path).put({ 
        content: fs.readFileSync(path, 'utf8') // Just update the content not the path. (Performance)
      }).then(console.log('Done!'))
    
    })
    .on('unlink', async function (path) { 
    
      log(`File ${path} has been removed`);  
      
      gun.get('hub').get(path).put({
        file: null, // Delete references to the file givent that it's been deleted.
        content: null,
        
      })
      
    })
    .on('addDir', path => log(`Directory ${path} has been added`))
    .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', () => log('Initial scan complete. Ready for changes'))

}

module.exports = { watch : watch, }