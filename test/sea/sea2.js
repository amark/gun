/* global Gun,describe,expect,it,beforeEach */
/*eslint max-len: ["error", 95, { "ignoreComments": true }]*/
/*eslint semi: ["error", "always", { "omitLastInOneLineBlock": true}]*/
/*eslint object-curly-spacing: ["error", "never"]*/
/*eslint node/no-deprecated-api: [error, {ignoreModuleItems: ["new buffer.Buffer()"]}] */

var root;
var Gun;
(function(env){
  root = env.window ? env.window : global;
  env.window && root.localStorage && root.localStorage.clear();
  try{ require('fs').unlinkSync('data.json') }catch(e){}
  //root.Gun = root.Gun || require('../gun');
  if(root.Gun){
    //Gun = root.Gun = root.Gun;
  } else {
    var expect = global.expect = require("../expect");
    root.Gun = require('../../gun');
    //Gun.serve = require('../../lib/serve');
    //require('./s3');
    //require('./uws');
    //require('./wsp/server');
    require('../../lib/file');
    require('../../sea.js');
  }
}(this));

;(function(){
Gun = root.Gun
const SEA = Gun.SEA

if(!SEA){ return }

describe('SEA', function(){
  var user;
  var gun;
  it('is instantiable', done => {
    gun = Gun({ localStorage: true, radisk: false })
    user = gun.user()
    done()
  })

  it('register users', async done => {
    user.create('bob', 'test123', err => {
      console.log('sea', SEA.err)
      expect(err).toHaveProperty('ok')
      setTimeout(done, 30)
    })
  })

  it('login users', async done => {
    user.auth('bob', 'test123', err => {
      expect(err).toHaveProperty('ok')
      done()
    })
  })

})

})()
