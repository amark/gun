// @rogowski CAME UP WITH THIS BRILLIANT GENIUS ABSOLUTELY AMAZING AWESOME IDEA!!!!

/// This is a simple tool to generate logs in a Sequence Diagram compatible format.

var Trace = function() {}
Trace.traces=[];
Trace.log = function(evname, msg) {
  //if(!(console.only.i)){ return }
//   clearTimeout(Trace.log.to);
//   Trace.log.to = setTimeout(function(){
//     Trace.on('trace.end', {code: Trace.traces.join('\n')});
//   }, 1000);
  if (!msg) {
    //console.log('WARN, empty message: ',msg);
//         msg=evname;
//         evname = 'GUN';
  }
  if (!Trace.loglastev) {
    Trace.loglastev=evname||'GET';
    return;
  };
//       msg.lastev = Trace.loglastev;
  Trace.log.i = Trace.log.i ? ++Trace.log.i : 1;
  //console.log(`*(${Trace.log.i}) ${Trace.loglastev}->:%s, msg:`, evname, msg);

  var __ = (!msg||!msg['#'] ? '' : ('#'+msg['#']).slice(0,4)+'');
  var dam = (!msg||!msg.dam ? '' : ('dam:'+msg.dam));
  var at = (!msg||!msg['@'] ? '' : ('@'+msg['@']).slice(0,4)+'');
  var lS = (!msg||!msg.lS ? '' : ('lS:'+msg.lS));
  var id = (!msg||!msg.id ? '' : ('id:'+msg.id));
  var ram = (!msg||!msg.ram ? '' : ('ram:'+msg.ram));
  var get = (!msg||!msg.get ? '' : ('get:'+Trace.clean(msg.get)).slice(0,15)+'');
  var put = !(typeof msg === 'object' && ('put' in msg)) ? '' : ('put:'+Trace.clean(msg&&msg.put?msg.put:'')).slice(0,30)+'...';
  
//   Trace.loglastevdt Trace.loglastev;
//   Trace.loglastevdt = +new Date();

  var tm = +new Date();
  Trace.loglastevdt = +new Date();

//       if (dam && Trace.loglastev==='UNIVERSE') { evname='GET'; }
  var keys = Array.isArray(msg) ? keys.sort().join(',')
    : typeof msg==='object' ? Object.keys(msg).sort().join(',')
    : 'this';

  if (dam) {
    if (msg['#']) {
      evname='GUN';
    } else {
      Trace.loglastev='GUN';
    }
    Trace.traces.push(`${Trace.loglastev}->${evname}: (${Trace.log.i})  {${keys}} ${get} ${put} ${__} ${dam} ${ram} ${id} ${at} ${lS}`);
  } else {
    //Trace.traces.push(`${Trace.loglastev}->${evname}: (${Trace.log.i})  {${keys.slice(0,15)}} ${get} ${put} ${__} ${dam} ${ram} ${id} ${at} ${lS}`);
//     Trace.traces.push(Trace.loglastev+'->'+evname+': '+(Trace.log.i+') '+(console.only.i||''))+' '+__+' '+at);
      Trace.traces.push(Trace.loglastev+'->'+evname+': '+ Trace.log.i+') '+__+' '+at);
//     Trace.traces.push(`${Trace.loglastev}->${evname}: (${Trace.log.i}) {${!keys?'this':keys}}`);
  }

  Trace.loglastev   = evname;
  Trace.loglastevdt = tm;
};
Trace.clean = function(txt) { return JSON.stringify(typeof txt==='undefined' ? 'undef' : txt||null).replace(/"|\{|\}+/g,'').slice(0,20).trim(); };
