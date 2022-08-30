/**
 * radisk3/book sanity tests
 * - long paths
 * - long data
 * - special characters
 * - escape sequences
 * - __proto__ pollution
 */
const expect = require('../expect');
const path = require('path');
const fs = require('fs');
const os = require('os');
const v8 = require('v8');
const { emitWarning, env } = require('process');

const ENABLE_GUN_LOGGING = process.env.ENABLE_GUN_LOGGING ?? false;
const WAIT = 1;
const ENABLE_MEMORY_PROFILE = process.env.ENABLE_MEMORY_PROFILE ?? false;
const SKIP_CHARS = process.env.SKIP_CHARS ?? true;
const KEEP_DATA = process.env.KEEP_DATA ?? true;
const CHAR_MAX = 65536;

const Log = (function () {
  let rootLog;
  const sane = text => text.replace(/[^a-zA-Z0-9\w\s\S]/g, '').trim();
  function Queue(opt) {
    opt = opt || {};
    buffer = [];
    const q = function queue(...args) {
      buffer.push(args);
    }
    function flush(out = opt.out || console.log) {
      let m;
      while (m = buffer.shift()) {
        out(...m);
      }
      buffer = [];
    }
    q.flush = flush;
    q.buffer = buffer;

    return q;
  }

  function Log(opt, parent, label) {
    opt = opt || {};
    label = label || '';
    label = sane(label);
    const queue = opt.queue || Queue(opt);
    const children = new Map();

    const l = function log(message, ...args) {
      // if (parent) return parent(message, ...args);
      const segments = [''.padEnd(l.layer, '\t'), message, ...args];
      l.queue(...segments);
      console.log(...segments);
      return l;
    };
    function info(...args) {
      return l('[info]', args.shift(), ...args);
    }
    function out(...args) {
      console.log(...args);
    }
    function flush() {
      queue.flush(out);
      return l;
    }
    function get(label) {
      label = sane(label);
      if (!l.children.has(label)) {
        l.children.set(label, new Log({ parent: l, queue: l.queue }, l, label));
      }
      return l.children.get(label);
    }
    function back() {
      return l.parent || l;
    }
    l.children = children;
    l.flush = flush;
    l.info = info;
    l.get = get;
    l.label = label;
    l.queue = queue;
    l.parent = parent;
    l.layer = 0;
    return l;
  }
  rootLog = Log({}, null, 'tests');
  return Log;
})(this);

const JS_NUMBER_MAX = 9007199254740991;
const JS_NUMBER_MAX_PLUS_ONE = BigInt(JS_NUMBER_MAX) + BigInt(1);
const FS_PATH_MAX_LENGTH = 4096;
const FS_NAME_MAX_LENGTH = 255;

const DATA_LENGTHS = [
  10,
  100,
  1000, // 1kb
  3000, // 3kb
  10000,
  100000,
  1000000, // 1 mb
  10000000, // 10mb
  50000000, // 50mb
  // 500000000, // 500mb
];

const PATH_TO_TEST_FOLDER = path.resolve(__dirname, 'booktestdata');
const PATH_TO_TEST_DB = path.resolve(PATH_TO_TEST_FOLDER, 'radatatest');
const PATH_TO_OLD_DB = path.resolve(PATH_TO_TEST_FOLDER, 'oldradata');
const PATH_TO_TEST_DB2 = path.resolve(PATH_TO_TEST_FOLDER, 'radatatest2');

const BOOK_SPECIAL_CHARS = ['\'|', '|\'', '|', '\'', '\n'];
const BOOK_PAGE_SIZE = 3000;

const PATH_SEGMENTS = ['node'];
const RAD_PATH_SEPARATORS = ['/', '.'];

const RE_UNPRINTABLE = /[^\x20-\x7E]/;
const RE_APOSTROPHES = /'/g;

/* unicode stuff */
const RE_UNICODE_SURROGATE = /[\uD800-\uDFFF]/;
const RE_SURROGATE_HIGH = /[\uD800-\uDBFF]/;
const RE_SURROGATE_HIGH_NORMAL = /[\uD800-\uDB75]/;
const RE_SURROGATE_HIGH_PRIVATE = /[\uDB80-\uDBFF]/;
const RE_SURROGATE_LOW = /[\uDC00-\uDFFF]/;

const RANGE_SURROGATES = [0xD800, 0xDFFF];
const RANGE_SURROGATE_HIGH = [0xD800, 0xDBFF];
const RANGE_SURROGATE_HIGH_NORMAL = [0xD800, 0xDB75];
const RANGE_SURROGATE_HIGH_PRIVATE = [0xDB80, 0xDBFF];
const RANGE_SURROGATE_LOW = [0xDC00, 0xDFFF];

const SURROGATES_HIGH = [...range(...RANGE_SURROGATE_HIGH_NORMAL)];
const SURROGATES_LOW = [...range(...RANGE_SURROGATE_LOW)];
const UNICODE_POINTS = [...permute(SURROGATES_HIGH, SURROGATES_LOW)];
const UNICODE_CHARS = UNICODE_POINTS.map(pair => [...pair.map(r => r.toString(16)), String.fromCodePoint(...pair)])

const RANGE_EMOJI = [[0xD83C, 0xDF00], [0xD83E, 0xDDFF]];

const ALL_CHARS = [...range(0, RANGE_SURROGATES[0] - 1), ...range(RANGE_SURROGATES[1] + 1, CHAR_MAX)].map(i => String.fromCharCode(i));


const ESCAPE_CHARS = [`\0`, `\u001b`, `\\`, `\\\\`, `\\\\\\`, '$`'];
const NORMAL_CHARS = ['A', 'B', 'C'];

const ESCAPE_FACTORIES = {
  ESCAPE_AS_NODE: (before, ec, c, after) => {
    ec = ec.length ? [ec] : [];
    return [...before, ...ec, c, ...after];
  },
  // ESCAPE_IN_PATH: (before, ec, c, after) => [...before, `${ec}${c}`, ...after],
  ESCAPE_AT_END: (before, ec, c, after) => {
    ec = ec.length ? [ec] : [];
    return [...before, `${c}`, ...after, ...ec];
  }
};

const ESCAPED_SPECIALS = BOOK_SPECIAL_CHARS.reduce((pe, cs) => [...pe, ESCAPE_CHARS.map(ec => `${ec}${cs}`)], []);
const SOUL_GAUNTLET = RAD_PATH_SEPARATORS
  .reduce((pc, ps) => [...pc, ...[...BOOK_SPECIAL_CHARS, ...ESCAPE_CHARS, ...ESCAPED_SPECIALS].reduce((pb, cb) =>
    [...pb,
    NORMAL_CHARS.map((nc) => `${nc}${cb}`),
    NORMAL_CHARS.map((nc) => `${cb}${nc}`),
    NORMAL_CHARS.map((nc) => `${cb}${cb}${nc}`),
    ], []).map(s => s.join(ps))], []);

const OPT_DEFAULTS = {
  file: PATH_TO_TEST_DB,
  localStorage: false,
  chunk: 1000
};

(function () {
  var root;
  var Gun;
  var Radix;
  var Radisk;
  var RFS;
  var Store;
  var env;
  var logger = Log();
  if (typeof global !== 'undefined') { env = global }
  if (typeof window !== 'undefined') { env = window }
  root = env.window ? env.window : global;

  try { var expect = root.expect = require("../expect") } catch (e) { }
  try { env.window && root.localStorage && root.localStorage.clear() } catch (e) { }

  if (!fs.existsSync(PATH_TO_TEST_FOLDER)) {
    fs.mkdirSync(PATH_TO_TEST_FOLDER, { recursive: true });
  }

  //try{ indexedDB.deleteDatabase('radatatest') }catch(e){}
  if (root.Gun) {
    root.Gun = root.Gun;
    // root.Gun.TESTING = true;
  } else {
    try { require('fs').unlinkSync('data.json') } catch (e) { }
    try { require('../../lib/fsrm')(PATH_TO_TEST_DB) } catch (e) { }
    root.Gun = require('../../gun');
    root.Gun.TESTING = true;
    Gun = root.Gun;
  }
  require("../../lib/book");
  // Radix = Gun?.window?.Radix || require("../../lib/radix");
  Radisk = Gun?.window?.Radisk || require("../../lib/radisk3");
  RFS = Gun?.window?.RFS || require('../../lib/rfs');
  require('../../lib/store');
  // require('../../lib/rindexed');
  env.v8 = v8;
  env.os = os;
  let seq = 0;

  describe('radisk3', function () {
    let r;
    let log = logger;
    let timer = Stopwatch({ log });

    before(function (done) {
      if (!fs.existsSync(PATH_TO_TEST_FOLDER)) {
        fs.mkdirSync(PATH_TO_TEST_FOLDER, { recursive: true });
      }
      unpersist();
      // r = buildRad();
      done();
    });

    beforeEach(function () {
      log = logger.get(this.currentTest.title);
      timer = Stopwatch({ log });
      log.layer = 0;
      // log(this.currentTest?.title);
      log.layer = 1;
    })

    after(() => {
      if (!KEEP_DATA) {
        unpersist();
      }
    });

    if (ENABLE_MEMORY_PROFILE) {
      let mem;
      let lastMem;
      let diffs = {};
      let fullTitle;
      let allTests = [];
      before(() => {
        diffs = {};
        mem = Memory({ env });
      })
      beforeEach(function () {
        fullTitle = testTitle(this.currentTest);
        lastMem = mem();
        this.currentTest.memoryBefore = lastMem;
      });
      afterEach(function () {
        // diffs[fullTitle] = mem.diff();
        this.currentTest.memoryAfter = mem();
        allTests.push(this.currentTest);
      });
      after(function () {
        log = logger;
        const completed = allTests.filter(t => t.memoryAfter);
        const memoryDiffs = completed.map(t => ({
          title: t.title,
          memory: mem(t.memoryBefore, t.memoryAfter)
        }));

        const byHeap = memoryDiffs.sort(by(md => md.memory.hused));
        log('Heap Usage');
        log.layer++;
        byHeap.slice(-5).forEach(d => logger(`${d.memory.hused} \t ${d.title}`));
        setTimeout(() => {
          log.flush();
        }, 2000);
      });
    }


    describe.skip('backwards compatibility', () => {
      it('can read older file versions', done => {
        done('not implemented');
      });
    });

    it('rad(string)', done => {
      r = buildRad();
      r('initialize', true, () => {
        r('initialize');
        r('test', '2', () => {
          r('test');
        });
      });
      // r('initialize');
      done();
    });

    describe('path', () => {
      describe('overwrite', () => {
        // FIXME cannot overwrite a path? it creates a duplicate...
        before((done) => {
          unpersist();
          r = buildRad();
          done();
        });
        it('writes initial value', done => {
          r('initial', 'value', () => {
            r('initial', (err, page, book) => {
              expect(err).to.not.be.ok();
              expect(page).to.be.ok();
              expect(page.book('initial')).to.eql('value');
              done();
            })
          });
        });
        it('reads initial value', done => {
          r('initial', (err, page, book) => {
            expect(err).to.not.be.ok();
            expect(page).to.be.ok();
            expect(page.book('initial')).to.eql('value');
            done();
          })
        });
        it('overwrites initial value', done => {
          r('initial', 'new value', () => {
            r('initial', (err, page, book) => {
              expect(err).to.not.be.ok();
              expect(page).to.be.ok();
              expect(page.book('initial')).to.eql('new value');
              done();
            });
          });
        });
        it('reads new value', done => {
          r('initial', (err, page, book) => {
            expect(err).to.not.be.ok();
            expect(page).to.be.ok();
            expect(page.book('initial')).to.eql('new value');
            done();
          })
        })
      });
      [true, false].forEach(reset => {
        [false, true].forEach(readonly => {
          // FIXME these combinations are all broken in slightly different ways
          // If more than one word is present in a file, it will fail to read
          // However, if the data is large enough to be given its own file, it reads fine
          describe(`consecutive ${readonly ? 'read' : 'write+read'} using ${reset ? 'new' : 'existing'} Radisk`, () => {
            if (!reset && !readonly) {
              before(() => unpersist());
            }
            (reset ? beforeEach : before)(() => {
              r = buildRad();
            });
            if (!readonly) {
              it('writes a', done => {
                r('a', 'a', () => {
                  r('a', done);
                })
              });
              it('writes b', done => {
                r('b', 'b', () => {
                  r('b', (err, page, book) => {
                    done();
                  });
                })
              });
            }
            it('reads a', done => {
              r('a', (err, page, book) => {
                expect(page.book('a')).to.eql('a');
                done();
              })
            });
            it('reads b (using test wrapper)', done => {
              r('b', (err, page, book) => {
                const v = getValueFromPage('b', page);
                if (v !== 'b') {
                  done('values did not match');
                  return;
                }
                done();
              })
            });
            it('reads b (using page.book())', done => {
              r('b', (err, page, book) => {
                const v = page.book('b', page);
                if (v !== 'b') {
                  done('values did not match');
                  return;
                }
                done();
              })
            });
          })
        })
      });
      describe('length', function () {
        before((done) => {
          unpersist();
          r = buildRad();
          r('init', done);
        });
        [1000, 10000000].forEach(dataLength => {
          [127, 255, BOOK_PAGE_SIZE - 10, BOOK_PAGE_SIZE, FS_PATH_MAX_LENGTH + FS_NAME_MAX_LENGTH + 2, FS_PATH_MAX_LENGTH * 10].forEach(pathLength => {
            // TODO? Ask mark about path hashing, should it be expected to be a thing with book, because book incurs conversion cost anyway
            const word = ''.padEnd(pathLength, `${pathLength}`);
            const value = ''.padEnd(dataLength, `${pathLength}value`);
            it(`write path.length ${pathLength} data.length ${dataLength}`, done => {
              r(word, value, (...args) => {
                // console.log({ args });
                // r2 = buildRad();
                r(word, (err, page, book) => {
                  const value = page.book(word);
                  expect(value).to.eql(value);
                  done();
                });
              });
              // done('not implemented');
            });
            it(`read path.length ${pathLength} data.length ${dataLength}`, done => {
              r(word, (err, page, book) => {
                const value = page.book(word);
                if (value !== value) {
                  console.log('unexpected value');
                }
                expect(value).to.eql(value);
                done();
              });
            });
          });
        });

        describe('longer than 255 (truncated)', () => {
          before(() => {
            r = buildRad();
          })
          const pathLength = 255;
          const dataLength = 1000000;
          const word = ''.padEnd(pathLength, `${pathLength}`) + 'a';
          const word2 = ''.padEnd(pathLength, `${pathLength}`) + 'b';
          const value = ''.padEnd(dataLength, `${pathLength}valuea`);
          const value2 = ''.padEnd(dataLength, `${pathLength}valueb`);
          it('writes', done => {
            r(word, value, () => {
              r(word, done);
            })
          });
          it('reads', done => {
            r(word, (err, page, book) => {
              const got = page.book(word);
              expect(got).to.be.ok();
              if (got !== value) {
                done('values did not match');
                return;
              }
              done();
            })
          });
          it('writes distinct path past 255', done => {
            r(word2, value2, () => {
              r(word2, done);
            })
          });
          it('reads distinct path past 255', done => {
            r(word2, (err, page, book) => {
              const v = page.book(word2);
              if (v !== value2) {
                done('values did not match');
                return;
              }
              done();
            })
          });
        });
      });
      describe('separators', () => {
        beforeEach(() => {
          unpersist();
          r = buildRad();
        })
        RAD_PATH_SEPARATORS.forEach(s => {
          it(`supports '${s}' as a separator`, done => {
            const soul = PATH_SEGMENTS.join(s);
            r(soul, soul);
            r(soul, (err, page, book) => {
              expect(getValueFromPage(soul, page)).to.eql(soul);
              done();
            });
          });
          it('should separate two keys', (done) => {
            seq++;
            let soul = `a${seq}${s}a`;
            let data = `data for '${soul}' ${seq}`;
            r(soul, data);
            r(soul, (err, res, o) => {
              const rd = getValueFromPage(soul, res);
              expect(rd).to.be.ok();
              expect(rd).to.eql(data);
              done();
            });
          });
        });
      });
      describe('special characters in path', () => {
        before(() => unpersist())
        beforeEach(() => {
          // unpersist();
          r = buildRad();
        });
        SOUL_GAUNTLET.forEach((soul, si) => {
          it(`write ${si + 1} of ${SOUL_GAUNTLET.length} #:${ellipsis(50, encodeURIComponent(soul))}`, done => {
            r(soul, soul, () => {
              r(soul, (err, page, book) => {
                expect(page).to.be.ok();
                expect(page.book(soul)).to.eql(soul);
                done();
              })
            });
          });
          it(`read ${si + 1} of ${SOUL_GAUNTLET.length} #:${ellipsis(50, encodeURIComponent(soul))}`, done => {
            r(soul, (err, page, book) => {
              expect(page).to.be.ok();
              expect(page.book(soul)).to.eql(soul);
              done();
            });
          });
        });
      });
      describe.skip('attacks', () => {
        describe('attempt to overwrite !', () => {
          before(() => {
            unpersist();
          });
          beforeEach(done => {
            r = buildRad();
            done();
          });
          it('writes initial value', done => {
            r('0', 'testvalue', () => {
              done();
            });
          });
          it('tries writing !', done => {
            r('!', ''.padEnd(10000000, 'haxxor'), () => {
              done();
            });
          });
          it('can still read initial value', done => {
            r('0', (err, page, book) => {
              expect(err).to.not.be.ok();
              expect(page).to.be.ok();
              expect(page.book('test')).to.eql('testvalue');
            });
          });
        });
        describe('attempt to overwrite %20', () => {
          before(() => {
            unpersist();
          });
          beforeEach(done => {
            r = buildRad();
            done();
          });
          it('writes initial value', done => {
            r('0', 'testvalue', () => {
              done();
            });
          });
          it('tries writing !', done => {
            r(' ', ''.padEnd(10000000, 'haxxor'), () => {
              done();
            });
          });
          it('can still read initial value', done => {
            r('0', (err, page, book) => {
              expect(err).to.not.be.ok();
              expect(page).to.be.ok();
              expect(page.book('test')).to.eql('testvalue');
            });
          });
        });
        describe('attempts to traverse directory', () => {
          before(() => {
            unpersist();
          });
          beforeEach(done => {
            r = buildRad();
            done();
          });
          it('writes initial value', done => {
            r('0', 'testvalue', () => {
              done();
            });
          });
          it('tries writing ../hax', done => {
            r('../hax', ''.padEnd(10000000, 'haxxor'), () => {
              const newPath = path.resolve(PATH_TO_TEST_DB, '..', 'hax');
              if (fs.existsSync(newPath)) {
                done('managed to traverse!');
                return;
              }
              done();
            });
          });
          it('can still read initial value', done => {
            r('0', (err, page, book) => {
              expect(err).to.not.be.ok();
              expect(page).to.be.ok();
              expect(page.book('test')).to.eql('testvalue');
            });
          });
        });
      });

      describe('shared roots', function () {
        const rt = RadTestifier(buildOpt({ file: PATH_TO_TEST_DB }));
        const tw = rt({ explain: true, newRad: false, clean: true });
        tw('alex', 'a value for alex');
        tw('alexandria', 'a value for alexandria');
        // tw('ale', ()=>{ // What should this do? }) 
        tw('toast', 'a value for toast');
      });
    });

    describe('data', () => {
      before(() => {
        unpersist();
        // r = buildRad();
      });
      describe('primitives', () => {
        const GUN_PRIMITIVES = [
          null,
          // {},
          // { key: 'value' },
          // { object: { key: 'value' } },
          '',
          'string',
          true,
          false,
          -Infinity,
          Infinity,
          NaN,
          -0, // FIXME javascript doesn't serialize this, fix manually with https://stackoverflow.com/questions/7223717/differentiating-0-and-0
          0,
          1,
          -1,
          1.0,
          -1.0,
          JS_NUMBER_MAX,
          JS_NUMBER_MAX + 1,
          JS_NUMBER_MAX_PLUS_ONE
        ]; // TODO? Are these all the primitives you got?


        GUN_PRIMITIVES.forEach((value, vi) => {
          describe(`${vi + 1} of ${GUN_PRIMITIVES.length}: ${typeof value}`, () => {
            before(() => {
              unpersist();
              r = buildRad();
            });
            const name = `type ${typeof value} value ${value}`;
            it(`writes ${typeof value} (${value})`, done => {
              r(name, value, () => {
                r(name, (err, page, book) => {
                  const result = page.book(name);
                  expect(typeof result).to.eql(typeof value);
                  if (typeof value !== 'bigint' && isNaN(value)) {
                    expect(isNaN(result)).to.eql(true);
                  } else {
                    expect(result === value).to.eql(true);
                    expect(result).to.eql(value);
                  }
                  done();
                });
              });
            });

            it(`reads ${typeof value} (${value})`, done => {
              r(name, (err, page, book) => {
                const result = page.book(name);
                expect(typeof result).to.eql(typeof value);
                if (typeof value !== 'bigint' && isNaN(value)) {
                  expect(result === value).to.eql(true);
                  expect(isNaN(result)).to.eql(true);
                } else {
                  expect(result).to.eql(value);
                }
                done();
              });
            });
          })

        });
        it.skip('should store numbers larger than 9007199254740992 as BigInt?', (done) => {
          // TODO? mark - does this make sense? it could cause peers running on different JS engines architectures to give different results
          // If so, this might be a case to run with PANIC as well
          done('indeterminate');
        });
      });
      it('can write & read objects', done => {
        r('object', { test: 'works' }, () => {
          r('object', (err, page, book) => {
            const harnessValue = getValueFromPage('object', page);
            expect(harnessValue).to.be.ok();
            expect(harnessValue.test).to.eql('works');
            const value = page.book('object');
            expect(typeof value).to.eql('object');
            expect(value).to.be.ok();
            expect(value.test).to.eql('works');
            done();
          });
        });
      });
      const LONG_DATAS = DATA_LENGTHS.map(l => ''.padEnd(l, `${l}B `));

      describe('length', function () {
        before(done => {
          unpersist();
          done();
        });
        beforeEach((done) => {
          r = buildRad();
          r('initialize', () => {
            function timeRad(r) {
              const ro = r;
              function rTimingWrapper(...args) {
                const cid = `${args[0]}`;
                const cbidx = args.indexOf(args.find(a => 'function' === typeof a));
                const callType = [-1, 1].includes(cbidx) ? 'read' : 'write';
                // console.log(`${cid} ${callType}`);
                const returnTimer = timer(`${callType} return`);
                const callbackTimer = timer(`${callType} callback`);
                const ret = ro(...args.map((a, i) => 'function' === typeof a ? (...cba) => {
                  // console.log(`callback ${cid}`, i);
                  callbackTimer(true);
                  a(...cba);
                } : a));
                returnTimer(false);
                return ret;
              }
              return rTimingWrapper;
            }
            r = timeRad(r);
            done();
          });
        });
        LONG_DATAS.forEach((d) => {
          const dk = `length.${d.length}B`;
          it(`writes ${d.length} bytes`, (done) => {
            r(dk, d, (err, ok) => {
              if (err) {
                console.log('ERR! waiting for ${dk} to write', err);
                done(false);
                return;
              }
              r(dk, (err, page, book) => {
                expect(page).to.be.ok();
                const value = page.book(dk);
                if (d !== value) {
                  done('result did not match');
                  // TODO is this a failure, or because I'm not reading the result properly?
                  // TODO when a split() happens, should that affect the resulting page?
                  return;
                }
                done();
              });
            });
            // console.time('test');
            // console.timeEnd('test');
          });
          it(`reads ${d.length} bytes`, done => {
            r(dk, (err, page, book) => {
              expect(err).to.not.be.ok();
              expect(page).to.be.ok();
              const value = page.book(dk);
              expect(value).to.be.ok();
              if (value !== d) {
                done('result did not match');
                return;
              }
              done();
            });
          })
        });
      });

      LONG_DATAS.forEach(ld => {
        describe(`data length ${ld.length} bytes`, function () {
          // TODO refactor RadTestifier to work like it('writes', testify('alice','value')); you're creating a bunch of Rads at once and it's bad.
          const rt = RadTestifier(buildOpt({ file: PATH_TO_TEST_DB }));
          const tw = rt({ clean: true, newRad: true });
          tw(`sizeof.${ld.length}`, ld);
        });
      });
    });

    describe.skip('the speed', () => {
      const MAX_TIME = 5000;
      const MAX_COUNT = 60000;
      const DATA_LENGTH = 3 * 1024;
      let begin = Date.now();
      let elapsed = 0;
      let x;
      before(() => {
        begin = Date.now();
        unpersist();
        r = buildRad();
      });
      after(() => {
        const totalSize = ((x * DATA_LENGTH) / 1024 / 1024).toFixed(2);
        const dataRate = (totalSize / elapsed).toFixed(2);
        const writeRate = (x / elapsed).toFixed(2);
        log(`wrote ${x} ${(DATA_LENGTH / 1024).toFixed(2)}kB records in ${elapsed}ms`);
        log(`${totalSize}MB total \t${dataRate}MB/ms \t${writeRate} records/ms`);
      });
      function* generate() {
        let i = 0;
        while (i++ < MAX_COUNT && ((Date.now() - begin) < MAX_TIME)) {
          yield i;
        }
        return;
      }
      it('thrashes', done => {
        for (x of generate()) {
          elapsed = (Date.now() - begin);
          if ((elapsed > MAX_TIME) || x > MAX_COUNT) {
            // done();
            break;
            return;
          }
          r(`speed-at-${x}-${elapsed}ms`, ''.padEnd(DATA_LENGTH, `${x}speed+${elapsed}ms`), () => {
            elapsed = (Date.now() - begin);
            if ((elapsed > MAX_TIME) || x > MAX_COUNT) {
              done();
              return;
            }
          });
        }
        done();
      });
    });

    describe('other delimited paths', () => {
      if (SKIP_CHARS) {
        return;
      }
      const variants = [];
      const failures = [];

      const characterCategories = { BOOK_SPECIAL_CHARS };

      beforeEach(() => {
        unpersist();
        r = buildRad();
      });

      let t = Date.now();

      ALL_CHARS.forEach((char, ci) => {
        const isSpecial = RE_UNPRINTABLE.test(char);
        const codes = [...char].map(c => c.charCodeAt(0));
        it(`char ${ci} of ${ALL_CHARS.length - 1}`, done => {
          r(char, char, () => {
            r(char, (err, page, book) => {
              expect(err).not.ok();
              expect(page).ok();
              const value = page.book(char);
              expect(char).eql(value);
              done();
            });
          });
        });
      });

      Object.entries(characterCategories).forEach((characterCategory) => {
        const [keyCategory, keys] = characterCategory;
        Object.keys(ESCAPE_FACTORIES).forEach(escapeVariantKey => {
          ESCAPE_CHARS.forEach(escapeCharacter => {
            RAD_PATH_SEPARATORS.forEach((pathSeparator, di) => {
              keys.forEach((key, i) => {
                for (let si = 0; si <= PATH_SEGMENTS.length; si++) {
                  const beginning = PATH_SEGMENTS.slice(0, si);
                  const end = PATH_SEGMENTS.slice(si);
                  const variantSegments = [...ESCAPE_FACTORIES[escapeVariantKey](beginning, escapeCharacter, key, end)];
                  const word = variantSegments.join(pathSeparator);
                  variants.push({
                    word,
                    variantSegments,
                    escapeCharacter,
                    escapeVariantKey,
                    pathSeparator,
                    key,
                    keyCategory
                  });
                }
              });
            });
          });
        });
      });

      variants.sort(by(x => (x + ' ').charCodeAt(0))).forEach((variant, i) => {
        const soul = variant.word;
        let data = `data for ${soul} ${i}`;
        const soulCodes = soul.split('').map(l => l.charCodeAt(0));
        const numericSoul = soulCodes.map(x => `${x}`.padStart(6, ' ')).join('');
        const variantName = `${i} of ${variants.length} book ${numericSoul} # (${soul}) => ${data}`;

        it(variantName, (done) => {
          r(soul, data, () => {
            r(soul, (err, page, book) => {
              if (err) {
                done(err);
                return;
              }
              const value = page.book(soul); // getValueFromPage(soul, res); // TODO mark fix this
              if (value !== data) {
                console.log(`values didn't match`);
                const bookKeys = Object.keys(book.all);
                if (!bookKeys.length) {
                  console.log('no keys in book.all for ', variant);
                }
                addFailure(variant);
                done('values did not match');
                return;
              }

              expect(value).to.eql(data);
              done();
            });
          });
        });
      });

      function addFailure(failure) {
        failures.push(failure);
      }
    });
  });


  function RadTestifier(radOrOpt) {
    log = logger;

    const testDefaults = () => ({
      /** Whether to remove 'file' */
      clean: true,
      /** Perform the write step? (or reading from existing file?) */
      write: true,
      /** Perform the read step? */
      read: true,
      /** Create a new Radisk instance for reading? */
      newRad: true,
      /** Try to explain why tests fail */
      explain: false
    });

    const t = function testify(testOpt = testDefaults()) {
      const opt = Object.assign({}, testDefaults(), testOpt || {});
      return function (word, is, finish) {
        if (finish) {
          // assume the setup work has been done?
          makeRad(radOrOpt, () => {
            opt.clean && cleanFn()();
            opt.write && write(rad, word, is, () => {
              opt.newRad && makeRad(radOrOpt);
              opt.read && read(rad, word, is, finish);
            });
          });
          return t;
        }
        opt.clean && before(cleanFn());
        opt.newRad ? beforeEach(makeRad()) : before(makeRad());
        opt.clean && it(`isn't already defined`, done => read(rad, word, (data) => !data, done));
        opt.write && it('write', done => write(rad, word, is, done));
        // opt.newRad && it('create a new Rad', makeRad());
        opt.read && it('read', done => read(rad, word, is, done));
        return t;
      }
    };
    let rad;

    function write(rad, word, is, done) {
      return rad(word, is, () => read(rad, word, is, done));
    }
    function read(rad, word, is, done) {
      return rad(word, verifyFn(word, is, done));
    }

    function verifyFn(word, is, done) {
      return function (err, page, book) {
        expect(err).to.not.be.ok();
        expect(page).to.be.ok();
        const data = page.book(word);
        if ('function' === typeof is) {
          expect(is(data)).to.be.ok();
          done();
          return;
        }
        if (data !== is) {
          const manualData = getValueFromPage(word, page);
          if (manualData === is) {
            log('manual search found a match...');
          }
          // expect(data).to.eql(is);
          done('data did not match');
          return;
        }
        done();
      }
    }
    function cleanFn() {
      return done => {
        unpersist(radOrOpt);
        done && done();
      }
    }
    function makeRad(opt = radOrOpt) {
      if ('function' === typeof radOrOpt) {
        return radOrOpt;
      }
      return done => {
        rad = buildRad(opt);
        rad('init', (err, page, book) => {
          rad.book = watch(rad.book);
          rad = watch(rad);
          done && done.call && done();
        });
      }
    }
    function watch(subject, { before, after } = {}) {
      return subject; // TODO remove this when ready to add perf
      if (!subject) return;
      if (subject.__watched) {
        return subject;
      }

      const w = function watcher(...args) {
        let ret;
        const subject = w.subject;
        try {
          before && before(args, subject);
          ret = subject.call(subject, ...args);
        } catch (e) {
          log(`ERR! in ${subject.name}()`, e);
        } finally {
          after && after(ret, args, subject);
        }
        return ret;
      }

      w.subject = subject;

      const wProto = Object.entries(subject).reduce((proto, subjectProp) => {
        const propVal = subjectProp[1], propName = subjectProp[0];
        if ('function' === typeof propVal) {
          proto[propName] = (...args) => {
            log(`${propVal.name}()`);
            const ret = propVal.call(subject, ...args);
            return ret;
          }
        } else {
          proto[propName] = (propVal);
        }
        return proto;
      }, { __watched: true });

      Object.assign(w, wProto);

      return w;
    }
    t.cleanFn = cleanFn;
    t.verifyFn = verifyFn;
    t.read = read;
    t.write = write;
    t.makeRad = makeRad;
    t.watch = watch;

    return t;
  }

  function unpersist(opt) {
    opt = opt || { file: PATH_TO_TEST_DB };
    opt.file = opt.file || PATH_TO_TEST_DB;
    delete RFS[opt.file];
    fs.rmdirSync(opt.file, { recursive: true });
    expect(fs.existsSync(opt.file)).to.not.be.ok();
  }

  function buildOpt(overrides) {
    overrides = overrides || {};
    const opt = {
      ...OPT_DEFAULTS, ...overrides
    };
    opt.log = (msg, ...args) => {
      if (ENABLE_GUN_LOGGING) {
        console.log(`  ${msg}`, ...args);
      }
    };
    delete RFS[opt.file];
    opt.store = RFS(opt);
    return opt;
  }

  function buildRad(overrides = {}) {
    const opts = buildOpt(overrides);
    // console.log('building Radisk with', opts);
    return Radisk(opts);
  }

}(this));

function findInList(list, word) {
  return (list || []).find(b => b.word === word);
}
function getValueFromPage(soul, res) {
  // return res;
  // console.log(`getting ${soul} from`, res);
  const bookList = res?.list || res?.book.list;
  if (!bookList) {
    return null;
  }
  const book = findInList(bookList, soul);
  if (!book || !book.is) {
    return null;
  }
  return book.is;
}

function* permute(a, b) {
  for (let ai = 0; ai < a.length; ai++) {
    const av = a[ai];
    for (let bi = 0; bi < b.length; bi++) {
      const bv = b[bi];
      yield [av, bv];
    }
  }
  // return a.reduce((ap, ac) => [...ap, ...b.map((bc) => [ac, bc])], []);
}

function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

function Memory(opt) {
  opt = opt || {};
  const env = opt.env || {};
  const base = opt.base;

  function values() {
    return {
      total: env.os.totalmem() / 1024 / 1024,
      free: env.os.freemem() / 1024 / 1024,
      used: env.process.memoryUsage().rss / 1024 / 1024,
      hused: v8.getHeapStatistics().used_heap_size / 1024 / 1024,
    }
  }

  var m = function memory(then, now) {
    if (then && now) {
      return diff(then, now);
    }
    return values();
  };

  m.values = values;
  m.diff = diff;

  function diff(then = base, now = values()) {
    then = then || now;
    return Object.entries(now).reduce((p, c) => {
      return { ...p, [c[0]]: c[1] - then[c[0]] };
    }, {});
  }

  return m;
}

function testTitle(test) {
  const anc = [];
  do {
    anc.unshift(test);
  } while (test = test.parent);
  return anc.map(t => t.title).join(' > ');
}

function by(map) {
  return (a, b) => map(a) - map(b);
}

function Stopwatch(opt) {
  opt = opt || {};
  const log = opt.log || function () { };

  const t = function timer(name = 'default') {
    const start = Date.now();
    return (announce = false) => {
      const elapsed = Date.now() - start;
      announce && t.log(elapsed, 'ms for', name);
      return elapsed;
    };
  }

  t.log = log;
  opt.timer = t;

  return t;
}

function ellipsis(maxLength, text) {
  const diff = maxLength - text.length;
  const dots = '...';

  if (diff >= 0) {
    return text;
  }

  const fromEnds = ((maxLength - 3) / 2);

  return `${text.slice(0, fromEnds)}...${text.slice(-fromEnds)}`;
}