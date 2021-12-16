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
  options = options ?? { msg: true, hubignore: false, alias: require('os').userInfo().username }
  
  options.msg = options.msg ?? true;
  options.hubignore = options.hubignore ?? false;
  options.alias = options.alias ?? require('os').userInfo().username
  
  let modifiedPath = options.alias;

  let watcher; 
  try {

    if (options.hubignore) {

      watcher = chokidar.watch(what, {
        persistent: true
      });
    
    } else if (!options.hubignore) {

      watcher = chokidar.watch(what, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
      });

    }
    
    const log = console.log.bind(console);
    
    let hubignore;

    // Handle events !
    watcher
      .on('add', async function(path) { 

        if (options.hubignore && path.includes('.hubignore')) {

          hubignore = fs.readFileSync(what + '/.hubignore', 'utf-8');

        } else if (!path.includes('.hubignore') && !hubignore?.includes(path.substring(path.lastIndexOf("/") + 1))) {

          if (options.msg) log(`File ${path} has been added`);

          if(path[path.search(/^./gm)] === "/" || ".") {
            gun.get('hub').get(modifiedPath + path.split(require('os').userInfo().username)[1]).put(fs.readFileSync(path, 'utf-8'))
          } else {
            gun.get('hub').get(modifiedPath + '/' + path.split(require('os').userInfo().username)[1]).put(fs.readFileSync(path, 'utf-8'))
          }

        } else {

          if(options.msg) log(`The addition of ${path} has been ignored !`)

        }
     
      })
      .on('change', async function(path) { 

        if (options.hubignore && path.includes('.hubignore')) {

          hubignore = fs.readFileSync(what + '/.hubignore', 'utf-8');

        } else if (!path.includes('.hubignore') && !hubignore?.includes(path.substring(path.lastIndexOf('/') + 1))) {
          
          if (options.msg) log(`File ${path} has been changed`);
          if(path[path.search(/^./gm)] === "/" || ".") {
            gun.get('hub').get(modifiedPath + path.split(require('os').userInfo().username)[1]).put(fs.readFileSync(path, 'utf-8'))
          } else {
            gun.get('hub').get(modifiedPath + '/' + path.split(require('os').userInfo().username)[1]).put(fs.readFileSync(path, 'utf-8'))
          }
        
        } else {

          if(options.msg) log(`The changes on ${path} has been ignored.`)

        }

      })
      .on('unlink', async function (path) {
        
        if (options.hubignore && path.includes('.hubignore')) {
          
          hubignore = fs.readFileSync(what + '/.hubignore', 'utf-8');

        } else if (!path.includes('.hubignore') && !hubignore?.includes(path.substring(path.lastIndexOf('/') + 1))) {

          if(options.msg) log(`File ${path} has been removed`);  
          if(path[path.search(/^./gm)] === "/" || ".") {
            gun.get('hub').get(modifiedPath + path.split(require('os').userInfo().username)[1]).put(null)
          } else {
						gun.get('hub').get(modifiedPath + '/' + path.split(require('os').userInfo().username)[1]).put(null)
          }


        } else {

          if(options.msg) log(`The deletion of ${path} has been ignored!`)

        }
      
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