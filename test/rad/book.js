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
  var RAD = (setTimeout.RAD) || require('../../lib/radisk');
  var Book = (setTimeout.Book) || require('../../lib/book');
  //opt.store = ((Gun.window && Gun.window.RindexedDB) || require('../../lib/rfs'))(opt);
  opt.chunk = 1000;
  var rad = RAD(opt), esc = String.fromCharCode(27);

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

    describe('Book Format', function(done){
        var B = Book;
        it('encode decode', function(){
            expect(B.decode(B.encode(null))).to.be(null);
            expect(B.decode(B.encode(false))).to.be(false);
            expect(B.decode(B.encode(true))).to.be(true);
            expect(B.decode(B.encode(0))).to.be(0);
            expect(B.decode(B.encode(-Infinity))).to.be(-Infinity);
            expect(B.decode(B.encode(Infinity))).to.be(Infinity);
            expect(B.decode(B.encode(1))).to.be(1);
            expect(B.decode(B.encode(2))).to.be(2);
            expect(B.decode(B.encode(1.2))).to.be(1.2);
            expect(B.decode(B.encode(1234.56789))).to.be(1234.56789);
            expect(B.decode(B.encode(''))).to.be('');
            expect(B.decode(B.encode("hello world"))).to.be("hello world");
            expect(B.decode(B.encode("he||o"))).to.be("he||o");
            expect(B.decode(B.encode("ho|y ha|o"))).to.be("ho|y ha|o");
            expect(B.decode(B.encode("he||||y"))).to.be("he||||y");
            expect(B.decode(B.encode("ho|\|ow"))).to.be("ho|\|ow");
            expect(B.decode(B.encode("so\\rrow"))).to.be("so\\rrow");
            expect(B.decode(B.encode("bo\\|\|row"))).to.be("bo\\|\|row");
            expect(B.decode(B.encode("||\áãbbçcddéẽffǵghhíĩj́jḱkĺlḿmńñóõṕpqqŕrśsttẃwúǘũxxýỹźzàbcdèfghìjklm̀ǹòpqrstùǜẁxỳz|"))).to.be("||\áãbbçcddéẽffǵghhíĩj́jḱkĺlḿmńñóõṕpqqŕrśsttẃwúǘũxxýỹźzàbcdèfghìjklm̀ǹòpqrstùǜẁxỳz|");
        });
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
      -0
    ];
    //var prim = ['alice', 'bob'];
    //var prim = [null];
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
        it('save '+type, done => { setTimeout(function(){
            rad('type-'+type, type, function(err, ok){
                expect(err).to.not.be.ok();
                rad('type-'+type, function(err, page){
                    var val = page.get('type-'+type);
                    expect(val).to.be(type);
                    done();
                });
            });
        },1); });
    });});

    describe('error on invalid primitives', function(){
        it('test invalid', done => {
            rad('type-NaN', NaN, function(err, ok){
                expect(err).to.be.ok();
                done();
            });
        });
    });

    describe('Async Race Conditions', function(){

        it('make sure word does not get duplicated when data is re-saved after read', done => {
            var opt = {file: 'zadata'}
            var prev = RAD(opt);

            prev('helloz', 'world', function(err, ok){

                prev('helloz', function(err, page){
                    prev('zalice', 'yay', function(err){
                        expect(page.text.split('helloz').length).to.be(2);
                        done();
                    });
                });
            });
            /*
                (A) READ ONLY: we receive a message, we READ only - parseless is important.
                (B) READ & WRITE: we write a page, and it already exists on disk.
                (C) WRITE ONLY: we write a page, and it is new to disk.
            */
        });

        it('test if adding an in-memory word merges with previously written disk data', done => {
            var prev = RAD(opt);

            prev('pa-alice', 'hello', function(err, ok){
                expect(err).to.not.be.ok();

                setTimeout(function(){
                    var rad = RAD(opt);

                    rad('pa-bob', 'banana', function(err, ok){
                        expect(err).to.not.be.ok();
                        var text = rad.book.list[0].text;
                        var i = text.indexOf('pa-alice');
                        expect(i).to.not.be(-1);
                        var ii = text.indexOf('hello');
                        expect((ii - i) < 10).to.be.ok();
                        done();
                    })
                },99);
            });
        });

        it('test if updating an in-memory word merges with previously written disk data', done => {
            var prev = RAD(opt);
            prev('pu-alice', 'hello', function(err, ok){
                expect(err).to.not.be.ok();

                var rad = RAD(opt);

                rad('pu-alice', 'cool', function(err, ok){
                    expect(err).to.not.be.ok();

                    var next = RAD(opt);
                    next('pu-alice', function(err, page){
                        expect('cool').to.be(page.get('pu-alice'));
                        done();
                    })
                });
            });
        });

    });

    describe('Recursive Book Lookups', function(){

        function gen(val){ return val + String.random(99,'a') }
        var opt = {file: 'gen'}
        //var rad = window.names = Book();
        var rad = window.names = RAD(opt);
        it('Generate more than 1 page', done => {

            var i = 0;
            names.forEach(function(name){
                name = name.toLowerCase();
                rad(name, gen(name));

                clearTimeout(done.c)
                done.c = setTimeout(done, 99);
            });

        });

        it('Make sure parseless lookup works with incrementally parsed values', done => {

            rad = RAD(opt);
            rad('adora', function(err, page){
                var n = page.get('adora');
                expect(gen('adora')).to.be(n);

                rad('aia', function(err, page){
                    var n = page.get('aia');
                    expect(gen('aia')).to.be(n);
                    done();
                });
            });

        });

        it('Read across the pages', done => {

            rad = RAD(opt);
            names.forEach(function(name){
                name = name.toLowerCase();
                rad(name, function(err, page){
                    var n = page.get(name);
                    expect(gen(name)).to.be(n);

                    clearTimeout(done.c);
                    done.c = setTimeout(done, 99);
                });
            });

        });


        /*it.skip('Correctly calculate size', done => {

            var r = String.random(1000);
            rad('a', r);

            r = String.random(2000);
            rad('b', r);

            r = String.random(3000);
            rad('c', r);

        });*/

    });

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
