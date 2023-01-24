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

describe('RAD', function(){

var names = ["Adalard","Adora","Aia","Albertina","Alfie","Allyn","Amabil","Ammamaria","Andy","Anselme","Ardeen","Armand","Ashelman","Aube","Averyl","Baker","Barger","Baten","Bee","Benia","Bernat","Bevers","Bittner","Bobbe","Bonny","Boyce","Breech","Brittaney","Bryn","Burkitt","Cadmann","Campagna","Carlee","Carver","Cavallaro","Chainey","Chaunce","Ching","Cianca","Claudina","Clyve","Colon","Cooke","Corrina","Crawley","Cullie","Dacy","Daniela","Daryn","Deedee","Denie","Devland","Dimitri","Dolphin","Dorinda","Dream","Dunham","Eachelle","Edina","Eisenstark","Elish","Elvis","Eng","Erland","Ethan","Evelyn","Fairman","Faus","Fenner","Fillander","Flip","Foskett","Fredette","Fullerton","Gamali","Gaspar","Gemina","Germana","Gilberto","Giuditta","Goer","Gotcher","Greenstein","Grosvenor","Guthrey","Haldane","Hankins","Harriette","Hayman","Heise","Hepsiba","Hewie","Hiroshi","Holtorf","Howlond","Hurless","Ieso","Ingold","Isidora","Jacoba","Janelle","Jaye","Jennee","Jillana","Johnson","Josy","Justinian","Kannan","Kast","Keeley","Kennett","Kho","Kiran","Knowles","Koser","Kroll","LaMori","Lanctot","Lasky","Laverna","Leff","Leonanie","Lewert","Lilybel","Lissak","Longerich","Lou","Ludeman","Lyman","Madai","Maia","Malvina","Marcy","Maris","Martens","Mathilda","Maye","McLain","Melamie","Meras","Micco","Millburn","Mittel","Montfort","Moth","Mutz","Nananne","Nazler","Nesta","Nicolina","Noellyn","Nuli","Ody","Olympie","Orlena","Other","Pain","Parry","Paynter","Pentheas","Pettifer","Phyllida","Plath","Posehn","Proulx","Quinlan","Raimes","Ras","Redmer","Renelle","Ricard","Rior","Rocky","Ron","Rosetta","Rubia","Ruttger","Salbu","Sandy","Saw","Scholz","Secor","September","Shanleigh","Shenan","Sholes","Sig","Sisely","Soble","Spanos","Stanwinn","Stevie","Stu","Suzanne","Tacy","Tanney","Tekla","Thackeray","Thomasin","Tilla","Tomas","Tracay","Tristis","Ty","Urana","Valdis","Vasta","Vezza","Vitoria","Wait","Warring","Weissmann","Whetstone","Williamson","Wittenburg","Wymore","Yoho","Zamir","Zimmermann"];

  var opt = {};
  opt.file = 'radatatest';
  var Radisk = (setTimeout.RAD) || require('../../lib/radisk');
  //opt.store = ((Gun.window && Gun.window.RindexedDB) || require('../../lib/rfs'))(opt);
  opt.chunk = 1000;
  var rad = Radisk(opt), esc = String.fromCharCode(27);

  describe('Book', function(){
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
        root.localStorage && root.localStorage.clear();
        //await new Promise(function(res){ indexedDB.deleteDatabase('radatatest').onsuccess = function(e){ res() } } );
        indexedDB.deleteDatabase('radatatest').onsuccess = function(e){ done() }
    });

    describe('BASIC API', function(done){

        it('write', function(done){
            rad('hello', 'world', function(err, ok){
                expect(err).to.not.be.ok();
                done();
            });
        });

        it('read', function(done){
            rad('hello', function(err, page){
                var val = page.get('hello');
                expect(val).to.be('world');
                done();
            })
        });
    });

    var prim = [
      null,
      'string',
      728858,
      BigInt(1000000000000000000000000000000000000000000000000000000000n),
      true,
      false,
      -Infinity,
      Infinity,
      NaN,
      -0
    ];
    var prim = ['alice', 'bob'];
    root.rad = rad;

    describe('can in-memory write & read all primitives', done => { prim.forEach(function(type){
        var b = setTimeout.Book();
        it('save '+type, done => { setTimeout(function(){
            b('type-'+type, type);
            var val = b('type-'+type);
            expect(val).to.be(type);
            done();
        },1); });
    });});

    describe('can disk write & read all primitives', done => { prim.forEach(function(type){
        var r = rad;
        it('save '+type, done => { setTimeout(function(){
            r('type-'+type, type, function(err, ok){
                expect(err).to.not.be.ok();
                r('type-'+type, function(err, page){
                    var val = page.get('type-'+type);
                    expect(val).to.be(type);
                    done();
                });
            });
        },1); });
    });});

  });

    var ntmp = names;
  describe.skip('RAD + GUN', function(){ return;
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

  });

});

}());