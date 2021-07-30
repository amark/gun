import { expectError } from 'tsd';

import Gun = require('../index');

Gun(['http://server1.com/gun', 'http://server2.com/gun']);
Gun({
  s3: {
    key: '',
    secret: '',
    bucket: ''
  },
  file: 'file/path.json',
  uuid() {
    return 'xxxxxx';
  }
});

interface AppState {
  object: {
    num: number;
    str: string;
    /** Comment test */
    bool: boolean;
    specstr: 'a' | 'b';
    obj: {
      arr2: Record<string, { foo: number; bar: string }>;
    };
  };
  chatRoom: Record<string, { by: string; message: string }>;
}

const app = new Gun<AppState>();

// Put and get something that was previously put
app.get('object')
  .get('bool')
  .put(true);
app.get('object')
  .get('num')
  .put(1);
app.get('object').put({
  bool: true
});

// Set and get something that was inserted using `set`.
const appSet = app.get('object')
  .get('obj')
  .get('arr2');
appSet.set({ foo: 1, bar: '2' });
// getting an auto-generated key may return an undefined value.
appSet.get('stringIdentifier').once(a => a?.foo);

expectError(
  app.get('object')
    .get('bool')
    .put(1));

app.get('object').on(data => {
  data.bool;
});

app.get('object').off();

app.get('object').once(data => {
  if (data) data.bool;
});

async function name() {
  const data = await app.get('object').promise!();
  data.put.bool;
}

app.get('chatRoom').time!({ by: 'A', message: 'Hello' });

app.get('chatRoom').time!(msg => {
  msg.by;
}, 20);

expectError(
  app.get('object').time!({ a: 1 }));

class X {
  val: string = 'someString';
  b() { }
}

interface BadState {
  // Top level primitives
  a: 1;
  b: {
    // Ban functions
    c: () => void;
    // Ban class
    d: typeof X;
    // Recursive check for banned types
    e: {
      f: () => void;
    };
  };
  // Filter, remove functions on prototype.
  c: X;
}

const bad = new Gun<BadState>();

expectError(
  bad.get('a').put(1));

expectError(bad.get('b')
  .get('c')
  .put(() => { }));

expectError(bad.get('b')
  .get('d')
  .put(X));

expectError(
  bad.get('b').put({ c: () => { }, d: X, e: { f: () => { } } }));

expectError(
  bad.get('c').put(new X()));