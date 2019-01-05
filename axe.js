;(function(){

  /* UNBUILD */
  var root;
  if(typeof window !== "undefined"){ root = window }
  if(typeof global !== "undefined"){ root = global }
  root = root || {};
  var console = root.console || {log: function(){}};
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var common = module }
  /* UNBUILD */

  ;USE(function(module){
    if(typeof window !== "undefined"){ module.window = window }
    var tmp = module.window || module;
    var AXE = tmp.AXE || function(){};

    if(AXE.window = module.window){ try{
      AXE.window.AXE = AXE;
      tmp = document.createEvent('CustomEvent');
      tmp.initCustomEvent('extension', false, false, {type: "AXE"});
      (window.dispatchEvent || window.fireEvent)(tmp);
      window.postMessage({type: "AXE"}, '*');
    } catch(e){} }

    try{ if(typeof common !== "undefined"){ common.exports = AXE } }catch(e){}
    module.exports = AXE;
  })(USE, './root');
  
  ;USE(function(module){

    var AXE = USE('./root'), Gun = (AXE.window||{}).Gun || USE('./gun', 1);
    (Gun.AXE = AXE).GUN = AXE.Gun = Gun;

    Gun.on('opt', function(at){
      if(!at.axe){
        at.axe = {};
        var p = at.opt.peers, tmp;
        // 1. If any remembered peers or from last cache or extension
        // 2. Fallback to use hard coded peers from dApp
        // 3. Or any offered peers.
        //if(Gun.obj.empty(p)){
        //  Gun.obj.map(['http://localhost:8765/gun'/*, 'https://guntest.herokuapp.com/gun'*/], function(url){
        //    p[url] = {url: url, axe: {}};
        //  });
        //}
        // Our current hypothesis is that it is most optimal
        // to take peers in a common network, and align
        // them in a line, where you only have left and right
        // peers, so messages propagate left and right in
        // a linear manner with reduced overlap, and
        // with one common superpeer (with ready failovers)
        // in case the p2p linear latency is high.
        // Or there could be plenty of other better options.
        console.log("axe", at.opt);
        if(at.opt.super){
          function verify(msg, send, at) {
            var peers = Object.keys(p), puts = Object.keys(msg.put), i, j, peer;
            var soul = puts[0]; /// TODO: verify all souls in puts. Copy the msg only with subscribed souls?
            for (i=0; i < peers.length; ++i) {
              peer = p[peers[i]];
              //if (peer.url) {console.log('AXE do not reject superpeers'); send(msg, peer); continue;} /// always send to superpeers?
              if (!peer.id) {console.log('AXE peer without id: ', peer); continue;}
              if (!Gun.subscribe[soul] || !Gun.subscribe[soul][peer.id]) { console.log('AXE SAY reject msg to peer: %s, soul: %s', peer.id, soul); continue; }
              send(msg, peer);
            }
          }
          AXE.say = function(msg, send, at) {
            if (!msg.put) { send(msg); return; }
            console.log('AXE HOOK!! ', msg);
            verify(msg, send, at);
          };
          /// TODO: remove peer from all Gun.subscribe. On `mesh.bye` event?
        }
        if(at.opt.super){
          at.on('in', USE('./lib/super', 1), at);
        } else {
          //at.on('in', input, at);
        }
      }
      this.to.next(at); // make sure to call the "next" middleware adapter.
    });

    function input(msg){
      var at = this.as, to = this.to;
    }

    module.exports = AXE;
  })(USE, './axe');

}());
