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
        console.log("axe");
        if(at.opt.super){
          function verify(msg, send, at) {
            var peers = Object.values(p), puts = Object.keys(msg.put), i, j, peer;
            var soul = puts[0]; /// TODO: verify all souls in puts. Copy the msg only with subscribed souls?
            var subs = Gun.subscribe[soul];
	          if (!subs) { return; }
            for (i=0; i < subs.length; ++i) {
              peer = subs[i];
              send(msg, peer);
            }
          }
          AXE.say = function(msg, send, at) {
            if (!msg.put) { send(msg); return; }
            //console.log('AXE HOOK!! ', msg);
            verify(msg, send, at);
          };
        }
        if(at.opt.super){
          at.on('in', USE('./lib/super', 1), at);
          var timerGC, queueGC;
          at.on('bye', function(peer) {
            console.log('Garbage collector triggered by peer.id: ', peer.id);
            if (timerGC) { queueGC = true; return; }
            timerGC = throttleGC();
          });
          var throttleGC = function() {
            return setTimeout(function() {
              GC(Gun.subscribe, p);
              clearTimeout(timerGC);
              timerGC = null;
              if (queueGC) {
                queueGC = false;
                timerGC = throttleGC();
              }
            }, 1);
          };
        } else {
          var connections = 0;
          at.on('hi', function(opt) {
            this.to.next(opt);
            console.log('AXE PEER [HI]', new Date(), opt.pid);
            connections++;
            /// The first connection don't need to resubscribe the nodes.
            if (connections === 1) { return; }

            /// TODO: resync all nodes in gun/gap

            /// Resubscribe all nodes.
            setTimeout(function() {
              var souls = Object.keys(at.graph);
              for (var i=0; i < souls.length; ++i) {
                //at.gun.get(souls[i]).off();
                at.next[souls[i]].ack = 0;
                at.gun.get(souls[i]).once(function(){});
              }
            //location.reload();
            }, 500);
	        }, at);
          //at.on('in', input, at);
        }
      }
      this.to.next(at); // make sure to call the "next" middleware adapter.
    });

    function input(msg){
      var at = this.as, to = this.to;
	    console.log('AXE PEER [IN]: ', msg);
	    this.to.next(msg);
    }

    /// Garbage collector to remove peers subscriptions when disconnect
    // var peers = [1,3,5,7,9];
    // function shuffle(array) { var tmp, current, top = array.length; if(top) while(--top) {  current = Math.floor(Math.random() * (top + 1));   tmp = array[current];  array[current] = array[top]; array[top] = tmp;} return array;}
    // for (var peers=[],i=0;i<7000;++i) peers[i]=i;
    // peers = shuffle(peers).slice(2000);
    // var subscribes = {soula: [1,2,3,4,5,6,7,8,9,0], soulb: [1,2,3,4,5,6,7,8,9,0], soulc: [1,2,3,4,5,6,7,8,9,0]};
    // var subscribes = {}; for (var i=0;i<1000;++i) {subscribes['soul_'+i]= (function() {var a=[]; for(var i=0;i<100;i++){a.push(i)} return a;})()}
    function GC(subscribes, peers) {
      console.time('AXE GC');
      var souls = Object.keys(subscribes), soul, i;
      var peers = Object.values(peers);
      if (souls.length === 0) {return;}
      var removed = {};
      for (i=0; i < souls.length; ++i) {
        soul = souls[i];
        // removed[soul] = 0;
        var pidx = subscribes[soul].length;
        while (pidx--) {
          if (peers.indexOf(subscribes[soul][pidx]) === -1) {
            // console.log('REMOVED: Soul: %s, peer: ', soul, pidx, subpeers[pidx]);
            subscribes[soul].splice(pidx, 1);
            // removed[soul]++;
          } 
        }
        if (subscribes[soul].length === 0) { delete subscribes[soul]; }
      }
      console.timeEnd('AXE GC');
      // console.log('[AXE GC] Removed: ', removed);
    }
    module.exports = AXE;
  })(USE, './axe');

}());
