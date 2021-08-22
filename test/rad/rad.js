var root;
var Gun;
(function(){
  var env;
  if(typeof global !== 'undefined'){ env = global }
  if(typeof window !== 'undefined'){ env = window }
  root = env.window? env.window : global;
  try{ env.window && root.localStorage && root.localStorage.clear() }catch(e){}
  //try{ indexedDB.deleteDatabase('radatatest') }catch(e){}
  if(root.Gun){
    root.Gun = root.Gun;
    root.Gun.TESTING = true;
  } else {
    try{ require('fs').unlinkSync('data.json') }catch(e){}
    try{ require('../../lib/fsrm')('radatatest') }catch(e){}
    root.Gun = require('../../gun');
    root.Gun.TESTING = true;
    require('../../lib/store');
    require('../../lib/rfs');
  }

  try{ var expect = global.expect = require("../expect") }catch(e){}

}(this));

;(function(){
Gun = root.Gun

var Radix = (Gun.window && Gun.window.Radix) || require('../../lib/radix');

describe('RAD', function(){

var names = ["Adalard","Adora","Aia","Albertina","Alfie","Allyn","Amabil","Ammamaria","Andy","Anselme","Ardeen","Armand","Ashelman","Aube","Averyl","Baker","Barger","Baten","Bee","Benia","Bernat","Bevers","Bittner","Bobbe","Bonny","Boyce","Breech","Brittaney","Bryn","Burkitt","Cadmann","Campagna","Carlee","Carver","Cavallaro","Chainey","Chaunce","Ching","Cianca","Claudina","Clyve","Colon","Cooke","Corrina","Crawley","Cullie","Dacy","Daniela","Daryn","Deedee","Denie","Devland","Dimitri","Dolphin","Dorinda","Dream","Dunham","Eachelle","Edina","Eisenstark","Elish","Elvis","Eng","Erland","Ethan","Evelyn","Fairman","Faus","Fenner","Fillander","Flip","Foskett","Fredette","Fullerton","Gamali","Gaspar","Gemina","Germana","Gilberto","Giuditta","Goer","Gotcher","Greenstein","Grosvenor","Guthrey","Haldane","Hankins","Harriette","Hayman","Heise","Hepsiba","Hewie","Hiroshi","Holtorf","Howlond","Hurless","Ieso","Ingold","Isidora","Jacoba","Janelle","Jaye","Jennee","Jillana","Johnson","Josy","Justinian","Kannan","Kast","Keeley","Kennett","Kho","Kiran","Knowles","Koser","Kroll","LaMori","Lanctot","Lasky","Laverna","Leff","Leonanie","Lewert","Lilybel","Lissak","Longerich","Lou","Ludeman","Lyman","Madai","Maia","Malvina","Marcy","Maris","Martens","Mathilda","Maye","McLain","Melamie","Meras","Micco","Millburn","Mittel","Montfort","Moth","Mutz","Nananne","Nazler","Nesta","Nicolina","Noellyn","Nuli","Ody","Olympie","Orlena","Other","Pain","Parry","Paynter","Pentheas","Pettifer","Phyllida","Plath","Posehn","Proulx","Quinlan","Raimes","Ras","Redmer","Renelle","Ricard","Rior","Rocky","Ron","Rosetta","Rubia","Ruttger","Salbu","Sandy","Saw","Scholz","Secor","September","Shanleigh","Shenan","Sholes","Sig","Sisely","Soble","Spanos","Stanwinn","Stevie","Stu","Suzanne","Tacy","Tanney","Tekla","Thackeray","Thomasin","Tilla","Tomas","Tracay","Tristis","Ty","Urana","Valdis","Vasta","Vezza","Vitoria","Wait","Warring","Weissmann","Whetstone","Williamson","Wittenburg","Wymore","Yoho","Zamir","Zimmermann"];

//console.log("HYPER TEST");var z = 10000; while(--z){ names.push(Gun.text.random(7)) }this.timeout(9000);

  describe('Radix', function(){
    var radix = Radix();

    it('unit', function(){
        var rad = Radix();
        rad('asdf.pub', 'yum');
        rad('ablah', 'cool');
        rad('ab', {yes: 1});
        rad('node/circle.bob', 'awesome');

        expect(JSON.parse(JSON.stringify(rad('asdf.')))).to.be.eql({pub: {'': 'yum'}});
        expect(rad('nv/foo.bar')).to.be(undefined);
        expect(rad('ab')).to.eql({yes: 1});
        expect(JSON.parse(JSON.stringify(rad()))).to.be.eql({"a":{"sdf.pub":{"":"yum"},"b":{"lah":{"":"cool"},"":{"yes":1}}},"node/circle.bob":{"":"awesome"}});
    });

    it('radix write read', function(done){
        var all = {};
        names.forEach(function(v,i){
            v = v.toLowerCase();
            all[v] = v;
            radix(v, i)
        });
        expect(Object.empty(all)).to.not.be.ok();
        Radix.map(radix, function(v,k){
            delete all[k];
        });
        expect(Object.empty(all)).to.be.ok();
        done();
    });

    it('radix write read again', function(done){
        var all = {};
        names.forEach(function(v,i){
            v = v.toLowerCase();
            all[v] = v;
            //rad(v, i)
        });
        expect(Object.empty(all)).to.not.be.ok();
        Radix.map(radix, function(v,k){
            delete all[k];
        });
        expect(Object.empty(all)).to.be.ok();
        done();
    });

    it('radix read start end', function(done){
        var all = {}, start = 'Warring'.toLowerCase(), end = 'Zamir'.toLowerCase();
        names.forEach(function(v,i){
            v = v.toLowerCase();
            if(v < start){ return }
            if(end < v){ return }
            all[v] = v;
            //rad(v, i)
        });
        expect(Object.empty(all)).to.not.be.ok();
        Radix.map(radix, function(v,k, a,b){
            //if(!all[k]){ throw "out of range!" }
            delete all[k];
        }, {start: start, end: end});
        expect(Object.empty(all)).to.be.ok();
        done();
    });

    it('radix read start- end+', function(done){
        var all = {}, start = 'Warrinf'.toLowerCase(), end = 'Zamis'.toLowerCase();
        names.forEach(function(v,i){
            v = v.toLowerCase();
            if(v < start){ return }
            if(end < v){ return }
            all[v] = v;
            //rad(v, i)
        });
        expect(Object.empty(all)).to.not.be.ok();
        Radix.map(radix, function(v,k, a,b){
            //if(!all[k]){ throw "out of range!" }
            delete all[k];
        }, {start: start, end: end});
        expect(Object.empty(all)).to.be.ok();
        done();
    });
 
    it('radix reverse item', function(done){
        var opt = {reverse: 1, end: 'iesogon'};
        Radix.map(radix, function(v,k, a,b){
            expect(k).to.be('ieso');
            expect(v).to.be(96);
            return true;
        }, opt);
        done();
    });

    it('radix reverse', function(done){
        var r = Radix(), tmp;
        r('alice', 1);r('bob', 2);r('carl', 3);r('carlo',4);
        r('dave', 5);r('zach',6);r('zachary',7);
        var by = ['alice','bob','carl','carlo','dave','zach','zachary'];
        /*Object.keys(by).forEach(function(i){ var k = by[i]; console.log(k, i);
            r(k,i);
        });*/
        Radix.map(r, function(v,k, a,b){
            expect(by.pop()).to.be(k);
            tmp = v;
        }, {reverse: 1});
        expect(tmp).to.be(1);
        expect(by.length).to.be(0);
        Radix.map(r, function(v,k, a,b){
            tmp = v;
        });
        expect(tmp).to.be(7);
        done();
    });
  });

  if(Gun.window && !Gun.window.RindexedDB){ return }

  var opt = {};
  opt.file = 'radatatest';
  var Radisk = (Gun.window && Gun.window.Radisk) || require('../../lib/radisk');
  opt.store = ((Gun.window && Gun.window.RindexedDB) || require('../../lib/rfs'))(opt);
  opt.chunk = 1000;
  var rad = Radisk(opt), esc = String.fromCharCode(27);

  describe('Radisk', function(){
    this.timeout(1000 * 9);

    /*it('parse', function(done){
        this.timeout(60000);
        if(Gun.window){ return done() }
        var raw = require('fs').readFileSync(__dirname + '/parse.rad').toString();
        rad.parse('!', function(err, disk){
            console.log("!!!!", err);
        }, raw);
        return;
    });*/

    it('deleting old RAD tests (may take long time)', function(done){
        done(); // Mocha doesn't print test until after its done, so show this first.
    });
    it('deleted', function(done){
        this.timeout(60 * 1000);
        if(!Gun.window){ return done() }
        //await new Promise(function(res){ indexedDB.deleteDatabase('radatatest').onsuccess = function(e){ res() } } );
        indexedDB.deleteDatabase('radatatest').onsuccess = function(e){ done() }
    });

    it('write contacts', function(done){
        var all = {}, to, start;
        names.forEach(function(v,i){
            v = v.toLowerCase();
            all[v] = true;
            rad(v, i, function(err, ok){
                expect(err).to.not.be.ok();
                delete all[v];
                if(!Object.empty(all)){ return }
                done();
            })
        })
    });

    it('read contacts reverse', function(done){
        var opt = {};
        opt.reverse = true;
        opt.end = 'nothing';
        opt.start = 'keeley';
        var first, last;
        var all = {}, start = opt.start.toLowerCase(), end = opt.end.toLowerCase();
        names.forEach(function(v,i){
            v = v.toLowerCase();
            if(v < start){ return }
            if(end < v){ return }
            //console.log(v, i);
            all[v] = v;
            //rad(v, i)
        });
        rad('', function(err, data){
            Radix.map(data, function(v,k){
                //console.log(k, v);
                delete all[k];
            });
            if(!Object.empty(all)){ return }
            done();
        }, opt);
    });

    it('read contacts range', function(done){
        var opt = {};
        opt.end = 'nothing';
        opt.start = 'keeley';
        var first, last;
        var all = {}, start = opt.start.toLowerCase(), end = opt.end.toLowerCase();
        names.forEach(function(v,i){
            v = v.toLowerCase();
            if(v < start){ return }
            if(end < v){ return }
            //console.log(v, i);
            all[v] = v;
            //rad(v, i)
        });
        rad('', function(err, data){
            Radix.map(data, function(v,k){
                //console.log(k, v);
                delete all[k];
            });
            if(!Object.empty(all)){ return }
            done();
        }, opt);
    });

    it('read contacts start end', function(done){
        var opt = {};
        opt.start = 'Warring'.toLowerCase();
        opt.end = 'Zamir'.toLowerCase();
        var all = {}, find = '';
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v < opt.start){ return }
            if(opt.end < v){ return }
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        rad(find, function(err, data, o){
            Radix.map(data, function(v,k){
                //console.log(find+k, v);
                delete all[find+k];
            });
            if(!Object.empty(all)){ return }
            if(!data){ return } // in case there is "more" that returned empty
            done();
        }, opt);
    });

    it('read contacts', function(done){
        var all = {}, find = 'a';
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        rad(find, function(err, data){
            //console.log(">>>>>>>>> KUNG FOO PANDA <<<<<<<<<<<");
            //console.debug.i=1;console.log(data);
            Radix.map(data, function(v,k){
                delete all[find+k];
            });
            if(!Object.empty(all)){ return }
            done();
        });
    });

    it('read again', function(done){
        var all = {}, find = 'm';
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        rad(find, function(err, data, info){
            Radix.map(data, function(v,k){
                delete all[find+k];
            });
            if(!Object.empty(all)){ return }
            done();
        });
    });

    it('read bytes', function(done){
        var all = {}, find = 'm', to;
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        rad(find, function(err, data, info){
            expect(data).to.be.ok();
            Radix.map(data, function(v,k){
                delete all[find+k];
            });
            clearTimeout(to);
            to = setTimeout(function(){
                expect(Object.empty(all)).to.not.be.ok();
                done();
            },100);
        }, {limit: 1});
    });

  });

    var ntmp = names;
  describe('RAD + GUN', function(){
    this.timeout(1000 * 9);
    var ochunk = 1000;
    Gun.on('opt', function(root){
        root.opt.localStorage = false;
        Gun.window && console.log("RAD disabling localStorage during tests.");
        this.to.next(root);
    })
    var gun = Gun({chunk: ochunk});

    /*it('deleting old tests (may take long time)', function(done){
        done(); // Mocha doesn't print test until after its done, so show this first.
    }); it('deleted', function(done){
        this.timeout(60 * 1000);
        if(!Gun.window){ return done() }
        indexedDB.deleteDatabase('radatatest').onsuccess = function(e){ done() }
    });*/

    /*it('write same', function(done){
        var all = {}, to, start, tmp;
        var names = [], c = 285;
        while(--c){ names.push('bob') }
        names.forEach(function(v,i){
            all[++i] = true;
            tmp = v.toLowerCase();
            //console.only.i=1;console.log("save", tmp, v, i);
            gun.get('names').get(tmp).put({name: v, age: i}, function(ack){
                //console.log("???", ack);
                expect(ack.err).to.not.be.ok();
                delete all[i];
                if(!Object.empty(all)){ return }
                done();
            })
        });
    });*/

    it('write contacts', function(done){
        var all = {}, to, start, tmp;
        names.forEach(function(v,i){
            all[++i] = true;
            tmp = v.toLowerCase();
            gun.get('names').get(tmp).put({name: v, age: i}, function(ack){
                expect(ack.err).to.not.be.ok();
                delete all[i];
                if(!Object.empty(all)){ return }
                done();
            })
        })
    });

    it('read one', function(done){
        var g = Gun({chunk: ochunk});
        //gun.get('names').get({'.': {'*': find}, '%': 1000 * 100}).once().map().once(function(data, key){
        g.get('names').get('stu').once(function(data, key){ // on this chunk setting, Stu should be split between 2 files.
            if(done.c){ return } done.c = 1;
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
            done();
        });
    });

    it('small range', function(done){
        var check = {};
        gun.get('users').get('alice').put({cool: 'beans'});
        gun.get('users').get('alexander').put({nice: 'beans'});
        gun.get('users').get('bob').put({lol: 'beans'});
        //console.log("=================");console.only.i=1;
        gun.get('users').get({'.': {'*': 'a'}, '%': 1000 * 100}).map().on(function(d,k){
            //console.log("small range:", k, d);
            expect('a' === k[0]).to.be.ok();
            check[k] = d;
            if(check.alice && check.alexander){
                if(done.c){ return } done.c = 1;
                done();
            }
        });
    });

    /*it.only('small range once TEST', function(done){
        var gun = Gun({file: 'yuio'});
        var check = {};
        gun.get('people').get('alice').put({cool: 'beans'});
        gun.get('people').get('alexander').put({nice: 'beans'});
        gun.get('people').get('bob').put({lol: 'beans'});
        //setTimeout(function(){
        console.only.i=1;
        console.log("==================");
        console.log("==================");
        console.log("==================");
        gun.get('people').get({'.': {'*': 'a'}, '%': 1000 * 100}).once().map().once(function(d,k){
            console.log("***********", k,d);
            expect('a' === k[0]).to.be.ok();
            check[k] = d;
            if(check.alice && check.alexander){
                if(done.c){ return } done.c = 1;
                done();
            }
        });
        //},500);
    });*/

    it('small range once', function(done){
        var check = {};
        gun.get('people').get('alice').put({cool: 'beans'});
        gun.get('people').get('alexander').put({nice: 'beans'});
        gun.get('people').get('bob').put({lol: 'beans'});
        gun.get('people').get({'.': {'*': 'a'}, '%': 1000 * 100}).once().map().once(function(d,k){
            expect('a' === k[0]).to.be.ok();
            check[k] = d;
            if(check.alice && check.alexander){
                if(done.c){ return } done.c = 1;
                done();
            }
        });
    });
    
    it('small range twice', function(done){
        var check = {};
        var gun = Gun();
        gun.get('peoplez').get('alice').put({cool: 'beans'});
        gun.get('peoplez').get('alexander').put({nice: 'beans'});
        gun.get('peoplez').get('bob').put({lol: 'beans'});
        gun.get('peoplez').get({'.': {'*': 'a'}, '%': 1000 * 100}).once().map().once(function(d,k){
            expect('a' === k[0]).to.be.ok();
            check[k] = (check[k] || 0) + 1;
            expect(check[k]).to.be(1);
            if(check.alice && check.alexander){
                if(next.c){ return } next.c = 1;
                next();
            }
        });
        function next(){
        var neck = {};
        gun.get('peoplez').get({'.': {'*': 'a'}, '%': 1000 * 100}).once().map().once(function(d,k){
            expect('a' === k[0]).to.be.ok();
            neck[k] = d;
            if(neck.alice && neck.alexander){
                if(done.c){ return } done.c = 1;
                done();
            }
        });
        }
    });

    it('read contacts', function(done){
        var all = {}, find = 'm', to;
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        gun.get('names').get({'.': {'*': find}, '%': 1000 * 100}).once().map().once(function(data, key){
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
            expect('m' == key[0]).to.be.ok();
            delete all[key];
            clearTimeout(to);
            to = setTimeout(function(){
                expect(Object.empty(all)).to.be.ok();
                done();
            },100);
        });
    });

    it('read contacts again', function(done){
        var all = {}, find = 'a', to;
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        gun.get('names').get({'.': {'*': find}, '%': 1000 * 100}).once().map().once(function(data, key){
            //console.log("*******", key, data, this._.back.get);
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
            delete all[key];
            clearTimeout(to);
            to = setTimeout(function(){
                expect(Object.empty(all)).to.be.ok();
                done();
            },300);
        });
    });

    it('read contacts fresh', function(done){
        var gun = Gun({chunk: ochunk});
        var all = {}, find = 'b', to;
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v.indexOf(find) == 0){ all[v] = true }
        });
        gun.get('names').map().once(function(data, key){
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
            delete all[key];
            if(!Object.empty(all)){ return }
            clearTimeout(to);
            to = setTimeout(function(){
                expect(Object.empty(all)).to.be.ok();
                done();
                setTimeout(function(){
        gun.get('names').get({'.': {'*': find}, '%': 1000 * 100}).once().map().once(function(data, key){
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
        });
                },500);
            },100);
        });
    });

    it('read contacts smaller than cursor', function(done){ // TODO!!!
        var all = {}, cursor = 'm', to;
        names.forEach(function(v){
            v = v.toLowerCase();
            if(v < cursor){ all[v] = true }
        });
        gun.get('names').get({'.': {'<': cursor}, '%': 1000 * 100}).once().map().once(function(data, key){
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
            //if(!all.hasOwnProperty(key)){console.error(key);}
            expect(all.hasOwnProperty(key)).to.be.ok();
            delete all[key];
            clearTimeout(to);
            to = setTimeout(function(){
                expect(Object.empty(all)).to.be.ok();
                done();
            },100);
        });
    });

    it.skip('read contacts in descending order', function(done){ // TODO!!!
        var all = {}, to;
        names.forEach(function(v){
            all[v] = true;
        });
        gun.get('names').get({'.': {'-': 1}, '%': 1000 * 100, '-': 1}).once().map().once(function(data, key){
            expect(data.name).to.be.ok();
            expect(data.age).to.be.ok();
            delete all[key];
            clearTimeout(to);
            to = setTimeout(function(){
                expect(Object.empty(all)).to.be.ok();
                done();
            },100);
        });
    });

  });

});

}());
