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

const ENABLE_GUN_LOGGING = false;

const PATH_TO_TEST_FOLDER = path.resolve(__dirname, 'booktestdata');
const PATH_TO_OLD_DB = path.resolve(PATH_TO_TEST_FOLDER, 'oldradata');
const PATH_TO_TEST_DB = path.resolve(PATH_TO_TEST_FOLDER, 'radatatest');
const PATH_TO_TEST_DB2 = path.resolve(PATH_TO_TEST_FOLDER, 'radatatest2');

if (!fs.existsSync(PATH_TO_TEST_FOLDER)) {
  fs.mkdirSync(PATH_TO_TEST_FOLDER);
}
fs.rmdirSync(PATH_TO_TEST_DB, { recursive: true });

const BOOK_SPECIAL_CHARS = ['\'|', '|\'', '|', '\'', '\n'];
const BOOK_PAGE_SIZE = 3000;

const RAD_PATH_SEPARATORS = ['/', '.'];
const GUN_PRIMITIVES = [
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
]


var root;
var Gun;
var Radix;
var Radisk;
var RFS;

(function () {
  var env;
  if (typeof global !== 'undefined') { env = global }
  if (typeof window !== 'undefined') { env = window }
  root = env.window ? env.window : global;
  try { env.window && root.localStorage && root.localStorage.clear() } catch (e) { }
  //try{ indexedDB.deleteDatabase('radatatest') }catch(e){}
  if (root.Gun) {
    root.Gun = root.Gun;
    // root.Gun.TESTING = true;
  } else {
    try { require('fs').unlinkSync('data.json') } catch (e) { }
    try { require('../../lib/fsrm')(PATH_TO_TEST_DB) } catch (e) { }
    root.Gun = require('../../gun');
    root.Gun.TESTING = true;
  }

  try { var expect = global.expect = require("../expect") } catch (e) { }

  if (!root.Gun.SEA) {
    require('../../sea.js');
  }
}(this));

Gun = root.Gun;
require("../../lib/book");
Radix = Gun?.window?.Radix || require("../../lib/radix");
Radisk = Gun?.window?.Radisk || require("../../lib/radisk3");
RFS = require('../../lib/rfs');
require('../../lib/store');
require('../../lib/rindexed');

const RE_UNPRINTABLE = /[^\x20-\x7E]/;
const RE_APOSTROPHES = /'/g;

const SKIP_CHARS = false;
const CHAR_MAX = 330;
const UNPRINTABLE_MAX = 128; //65536;

const DATA_LENGTHS = [
  // 100,
  // 1000, // 1kb
  // 3000, // 3kb
  // 10000,
  100000,
  1000000, // 1 mb
  10000000, // 10mb
  50000000, // 50mb
  500000000, // 500mb
];
const LONG_DATAS = DATA_LENGTHS.map(l => ''.padEnd(l, '012345'));

const ALL_CHARS = [];
for (let i = 0; i < CHAR_MAX; i++) {
  ALL_CHARS.push(String.fromCharCode(i));
}
ALL_CHARS.push('\u001b');
const PRINTABLE_CHARS = ALL_CHARS.filter(c => !RE_UNPRINTABLE.test(c));
const UNPRINTABLE_CHARS = ALL_CHARS.filter(c => RE_UNPRINTABLE.test(c)).slice(0, UNPRINTABLE_MAX);
const ESCAPE_CHARS = [`\0`, `\u001b`, `\\`, `\\\\`, `\\\\\\`, `\\\\\\\\`];
const NORMAL_CHARS = ['A', 'B', 'C'];

const ESCAPE_FACTORIES = {
  ESCAPE_AS_NODE: (before, ec, c, after) => {
    ec = ec.length ? [ec] : [];
    return [...before, ...ec, c, ...after];
  },
  ESCAPE_IN_PATH: (before, ec, c, after) => [...before, `${ec}${c}`, ...after],
  ESCAPE_AT_END: (before, ec, c, after) => {
    ec = ec.length ? [ec] : [];
    return [...before, `${c}`, ...after, ...ec];
  }
};


function buildSoul(separator, ...args) {
  return args.join(separator);
}

const SOUL_GAUNTLET = RAD_PATH_SEPARATORS
  .reduce((pc, ps) => [...pc,
  ...[...BOOK_SPECIAL_CHARS, ...ESCAPE_CHARS].reduce((pb, cb) =>
    [...pb,
    NORMAL_CHARS.map((nc) => `${nc}${cb}`),
    NORMAL_CHARS.map((nc) => `${cb}${nc}`),
    NORMAL_CHARS.map((nc) => `${cb}${cb}${nc}`),
    ], [])], []);
// console.log(SOUL_GAUNTLET);
// const SOUL_GAUNTLET = [RAD_PATH_SEPARATORS, [PRINTABLE_CHARS], ESCAPE_FACTORIES, [BOOK_SPECIAL_CHARS, ESCAPE_CHARS]];
// [\x000/9.2%20b, ...]


const opt = {
  file: PATH_TO_TEST_DB,
  localStorage: false,
  log: (msg, ...args) => {
    if (ENABLE_GUN_LOGGING) {

      console.log(`  ${msg}`, ...args);
    }
  },
  chunk: 250
};
opt.store = RFS(opt);

let seq = 0;

describe('radisk3 & book', () => {
  let r;

  beforeEach(() => {
    // unpersist(opt);
    // expect(testDirExists()).to.be.false();
    r = buildRad(opt);
  });

  it('can read older file versions', done => {
    done('not implemented');
  });
  it('creates a ! file', (done) => {
    expect(testDirExists()).to.be.ok();
    done('not implemented');
  });
  it('loads a ! file if one exists', done => {
    // done();
    const r2 = buildRad(opt);
    // hmm
    done('not implemented');
  });

  describe('path', () => {
    it('supports arbitrarily long souls', done => {
      done('not implemented');
    });
    it('uses path delimiters interchangeably', done => {
      done('not implemented');
    });
    it('supports souls containing special characters', done => {
      done('not implemented');
    });
  });

  describe('data', () => {
    it('can write & read data spanning multiple pages', done => {
      done('not implemented');
    });
    it('can write & read all primitives', done => {
      done('not implemented');
    });
    it('can write & read objects', done => {
      done('not implemented');
    })
  })
});

const soulpermutations = [];
describe('RAD book', () => {
  let r;

  describe('node content length & paging', () => {
    beforeEach(() => {
      r = buildRad(opt);
    })
    LONG_DATAS.forEach((d) => {
      it(`handles data length of ${d.length} bytes`, (done) => {
        seq++;
        const dk = `root.seq${seq}`;
        console.log(`\n#[${dk}]\n`);
        r(dk, d, (err, ok) => {
          if (err) {
            console.log('ERR! waiting for ${dk} to write', err);
            done(false);
          }
        });
        console.time('test');
        r(dk, (err, res, o) => {
          const value = getValueFromPage(dk, res);
          if (!res) {
            console.log('no result', { err, res, o });
            done('nothing returned');
            return;
          }
          if (d !== value) {
            done('result did not match');
            // TODO is this a failure, or because I'm not reading the result properly?
            // TODO when a split() happens, should that affect the resulting page?
            return;
          }
          done();
        });
        console.timeEnd('test');
      });
    });
  });

  const pathSegments = ['a', 'b'];
  if (!SKIP_CHARS) {
    RAD_PATH_SEPARATORS.forEach((d, di) => {
      describe(`\`${d}\`-delimited paths`, () => {
        beforeEach(() => {
          r = buildRad(opt);
        });

        it('should separate two keys', (done) => {
          seq++;
          let soul = `a${seq}${d}a`;
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

      describe('other delimited paths', () => {
        const charCats = { PRINTABLE_CHARS };

        Object.entries(charCats).forEach((ckv) => {
          const PATH_CHARS = ckv[1];
          Object.keys(ESCAPE_FACTORIES).forEach(escapeVariantKey => {
            ESCAPE_CHARS.forEach(ec => {
              describe(`${ckv[0]} '${escape(ec)}' ${escapeVariantKey}`, () => {
                let rootKey;

                beforeEach(() => {
                  r = buildRad(opt);
                });

                PATH_CHARS.forEach((c, i) => {
                  for (let si = 0; si <= pathSegments.length; si++) {
                    const before = pathSegments.slice(0, si);
                    const after = pathSegments.slice(si);
                    const variant = [...ESCAPE_FACTORIES[escapeVariantKey](before, ec, c, after)];
                    variant[0] = `${variant[0]}${seq}`;
                    const rootKey = `${path[0]}${seq}`;
                    const soul = variant.join(d);
                    soulpermutations.push(soul);
                    let data = `data for ${soul} ${seq}`;

                    const numericSoul = soul.split('').map(x => `${x.charCodeAt(0)}`.padStart(6, ' ')).join('');

                    it(`${seq} ${numericSoul} # (${soul}) => ${data}`, (done) => {
                      seq++;
                      r(soul, data);

                      r(soul, (err, res, book) => {
                        if (err) {
                          done(err);
                          return;
                        }

                        const value = book(soul); // getValueFromPage(soul, res); // TODO mark fix this

                        if (value !== data) {
                          debugger;
                        }
                        expect(value).to.eql(data);
                        done();
                      });
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  }
  console.log(soulpermutations);
});

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

function findInList(list, word) {
  return (list || []).find(b => b.word === word);
}


function testDirExists() {
  return fs.readdirSync(PATH_TO_TEST_FOLDER).includes('radatatest');
}

function unpersist(opt) {
  opt = opt || { file: PATH_TO_TEST_DB };
  opt.file = opt.file || PATH_TO_TEST_DB;
  fs.rmdirSync(opt.file, { recursive: true });
}

function buildRad(opt) {
  return Radisk(opt);
}