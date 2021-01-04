// @rogowski CAME UP WITH THIS BRILLIANT GENIUS ABSOLUTELY AMAZING AWESOME IDEA!!!!
///// TESTS rogowski
Gun.traces=[`Participant GUN`];
// Gun.logs=[];
Gun._trace = function(evname, msg) {
  clearTimeout(Gun._trace.to);
  Gun._trace.to = setTimeout(function(){
    Gun.on('trace.end', {code: Gun.traces.join('\n')});
  }, 1000);
  if (!msg) {
    console.log('WARN, empty message: ',msg);
//         msg=evname;
//         evname = 'GUN';
  }
  if (!Gun._tracelastev) {
    Gun._tracelastev=evname||'PEER';
  };
//       msg.lastev = Gun._tracelastev;
  Gun._trace.i = Gun._trace.i ? ++Gun._trace.i : 1;
  console.log(`*(${Gun._trace.i}) ${Gun._tracelastev}->:%s, msg:`, evname, msg);

  var __ = (!msg||!msg['#'] ? '' : ('#:'+msg['#']).slice(0,6)+'...');
  var dam = (!msg||!msg.dam ? '' : ('dam:'+msg.dam));
  var at = (!msg||!msg['@'] ? '' : ('@:'+msg['@']).slice(0,9)+'...');
  var lS = (!msg||!msg.lS ? '' : ('lS:'+msg.lS));
  var id = (!msg||!msg.id ? '' : ('id:'+msg.id));
  var ram = (!msg||!msg.ram ? '' : ('ram:'+msg.ram));
  var get = (!msg||!msg.get ? '' : ('get:'+Gun._clean(msg.get)).slice(0,15)+'...');
  var put = !(typeof msg === 'object' && ('put' in msg)) ? '' : ('put:'+Gun._clean(msg&&msg.put?msg.put:'')).slice(0,30)+'...';
  
//   Gun._tracelastevdt Gun._tracelastev;
//   Gun._tracelastevdt = +new Date();

  var tm = +new Date();
  Gun._tracelastevdt = +new Date();

//       if (dam && Gun._tracelastev==='UNIVERSE') { evname='PEER'; }
  var keys = Array.isArray(msg) ? keys.sort().join(',')
    : typeof msg==='object' ? Object.keys(msg).sort().join(',')
    : 'this';
  if (dam) {
    if (msg['#']) {
      evname='GUN';
    } else {
      Gun._tracelastev='GUN';
    }
    Gun.traces.push(`${Gun._tracelastev}->${evname}: (${Gun._trace.i})  {${keys}} ${get} ${put} ${__} ${dam} ${ram} ${id} ${at} ${lS}`);
  } else {
    Gun.traces.push(`${Gun._tracelastev}->${evname}: (${Gun._trace.i})  {${keys.slice(0,15)}} ${get} ${put} ${__} ${dam} ${ram} ${id} ${at} ${lS}`);
//     Gun.traces.push(`${Gun._tracelastev}->${evname}: (${Gun._trace.i}) {${!keys?'this':keys}}`);
  }

  Gun._tracelastev = evname;
  Gun._tracelastevdt = tm;
};
Gun._clean = function(txt) { return JSON.stringify(typeof txt==='undefined' ? 'undef' : txt||null).replace(/"|\{|\}+/g,'').slice(0,20).trim(); };
