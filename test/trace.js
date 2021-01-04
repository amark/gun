// @rogowski CAME UP WITH THIS BRILLIANT GENIUS ABSOLUTELY AMAZING AWESOME IDEA!!!!
///// TESTS rogowski
Gun.logs=[`Participant GUN`];
// Gun.logs=[];
Gun._log = function(evname, msg) {
  clearTimeout(Gun._log.to);
  Gun._log.to = setTimeout(function(){
    Gun.on('trace.end', {code: Gun.logs.join('\n')});
  }, 1000);
  if (!msg) {
    console.log('WARN, empty message: ',msg);
//         msg=evname;
//         evname = 'GUN';
  }
  if (!Gun.lastev) { Gun.lastev=evname||'PEER'; };
//       msg.lastev = Gun.lastev;
  Gun._log.i = Gun._log.i ? ++Gun._log.i : 1;
  console.log(`*(${Gun._log.i}) ${Gun.lastev}->:%s, msg:`, evname, msg);

  var __ = (!msg||!msg['#'] ? '' : ('#:'+msg['#']).slice(0,6)+'...');
  var dam = (!msg||!msg.dam ? '' : ('dam:'+msg.dam));
  var at = (!msg||!msg['@'] ? '' : ('@:'+msg['@']).slice(0,9)+'...');
  var lS = (!msg||!msg.lS ? '' : ('lS:'+msg.lS));
  var id = (!msg||!msg.id ? '' : ('id:'+msg.id));
  var ram = (!msg||!msg.ram ? '' : ('ram:'+msg.ram));
  var get = (!msg||!msg.get ? '' : ('get:'+Gun._clean(msg.get)).slice(0,15)+'...');
  var put = !(msg && ('put' in msg)) ? '' : ('put:'+Gun._clean(msg.put)).slice(0,30)+'...';
//       if (dam && Gun.lastev==='UNIVERSE') { evname='PEER'; }
  var keys = Object.keys(msg||{}).sort();
  if (dam) {
    if (msg['#']) {
      evname='GUN';
    } else {
      Gun.lastev='GUN';
    }
    Gun.logs.push(`${Gun.lastev}->${evname}: (${Gun._log.i})  {${keys}} ${get} ${put} ${__} ${dam} ${ram} ${id} ${at} ${lS}`);
  } else {
    Gun.logs.push(`${Gun.lastev}->${evname}: (${Gun._log.i})  {${keys}} ${get} ${put} ${__} ${dam} ${ram} ${id} ${at} ${lS}`);
  }

  Gun.lastev = evname;
};
Gun._clean = function(txt) { return JSON.stringify(typeof txt==='undefined' ? 'undef' : txt||null).replace(/"|\{|\}+/g,'').slice(0,20).trim(); };