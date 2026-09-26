# gun.rel Relational Data API Guide

[中文版本](./gun-rel-cn.md)

## Why this API is needed

GUN’s graph model is naturally suited to distributed collaboration, but common needs like “sort by primary key,” “stable pagination,” and “fast lookup by field” become complex and unpredictable when implemented via raw graph traversal. `gun.rel` provides a lightweight relational abstraction that maps “tables, primary keys, indexes, and pagination” onto graph nodes and links. This keeps GUN’s distributed properties while enabling efficient, table-like pagination and queries.

## Problems solved by gun.rel

- **Stable pagination**: pages are ordered by auto-incrementing primary keys, independent of write order.
- **Fast lookups**: index nodes enable quick lookup by specific fields.
- **Structured writes**: primary keys, indexes, and sequences are handled consistently without ad‑hoc conventions.
- **Composable**: the relational structure still lives in the graph and can be combined with existing GUN APIs.

## Conflicts with other APIs

**No conflict.** `gun.rel` stores metadata, indexes, and row nodes under the fixed namespace `rel:*` and writes through the `rel` chain. It can be used alongside other GUN APIs without interfering with the rest of the graph.

**Usage cautions**
- In private environments, use it with `gun.user` to prevent third‑party tampering.
- `rel:*` metadata/index/sequence structures are validated; invalid writes return errors.
- `rel:*` index nodes only accept relationship links or deletions; other writes are rejected.
- Schema can only be initialized once. Later changes to primary keys or indexes will error; create a new table name and migrate if needed.

## How gun.rel works

- **Schema metadata**
  On first use, the table schema is written to a fixed namespace so all clients can read primary key and index definitions.
- **Auto‑increment sequence**
  A dedicated sequence node stores the current max id; each insert reads, increments, and writes back to keep the primary key monotonic.
- **Index writes**
  Insert/update operations write both the primary index and secondary indexes, each pointing to row nodes.
- **Paged reads**
  Pagination scans index key ranges, not the whole table, preserving order with a fixed page size.

## Data structure overview

Using `name = messages` as an example:

- Metadata: `rel:messages`  
  Stores schema info (primary key, index fields, etc.).
- Auto‑increment sequence: `rel:messages:seq`  
  Field `value` stores the current sequence value.
- Row node: `rel:messages:row:<id>`  
  Stores a single row, including the primary key field.
- Primary index: `rel:messages:idx:primary`  
  Keys look like `id:0000000001`, values are `{'#': '<rowSoul>'}`.
- Secondary index: `rel:messages:idx:<field>`  
  Keys look like `<field>:<value>:0000000001`, values are `{'#': '<rowSoul>'}`.

## gun.rel sub‑APIs

- `gun.rel(name, schema)`: create a relational chain and table definition (internally calls `relSchema`)
- `gun.rel().relSchema(schema)`: initialize schema metadata only (first call only; for staged or delayed init)
- `gun.rel().insert(row)`: insert a row and return `{ id, soul }`
- `gun.rel().upsert(id, row)`: update a row by primary key
- `gun.rel().delete(id)`: delete a row by primary key
- `gun.rel().page({ startId, limit, reverse })`: page by primary key

## Basic usage

```javascript
const gun = Gun();

const messageRel = gun.rel('messages', {
  type: 'rel',
  name: 'messages',
  primary: 'id',
  autoInc: true,
  indexes: ['ts', 'from']
});

const res = await messageRel.insert({
  from: 'pubA',
  text: 'hello',
  ts: Date.now()
});

await messageRel.upsert(res.id, {
  from: 'pubA',
  text: 'hello world',
  ts: Date.now()
});

await messageRel.delete(res.id);

const page = await messageRel.page({ limit: 20, reverse: true });
console.log(page.items);
```

## Examples with other APIs

### Using SEA encryption

```javascript
const gun = Gun();
const messageRel = gun.rel('messages', { primary: 'id', autoInc: true, indexes: ['ts'] });

const pair = await Gun.SEA.pair();
const secret = await Gun.SEA.secret(pair.epub, pair);
const cipher = await Gun.SEA.encrypt('secret message', secret);

await messageRel.insert({
  from: pair.pub,
  cipher,
  ts: Date.now()
});

const page = await messageRel.page({ limit: 20, reverse: true });
const text = await Gun.SEA.decrypt(page.items[0].cipher, secret);
console.log(text);
```

### Combining with gun.get / gun.put

```javascript
const gun = Gun();
const root = gun.get('app');
const dbNode = root.get('rel-container');
const messageRel = dbNode.rel('messages', { primary: 'id', autoInc: true, indexes: ['ts', 'from'] });

await messageRel.insert({ from: 'pubA', text: 'hi', ts: Date.now() });
const page = await messageRel.page({ limit: 10, reverse: true });

gun.get('rel:messages:row:' + page.items[0].id).put({ text: 'edit via put' });
gun.get('rel:messages:row:' + page.items[0].id).once((data) => console.log(data));
await messageRel.delete(page.items[0].id);
```

### Combining with native graph data

```javascript
const gun = Gun();
const graphRoot = gun.get('graph');
const appNode = graphRoot.get('app');
const profileNode = appNode.get('profile');
profileNode.put({ name: 'Alice', role: 'admin' });

const relContainer = appNode.get('rel-container');
const orderRel = relContainer.rel('orders', { primary: 'id', autoInc: true, indexes: ['userId', 'ts'] });
await orderRel.insert({ userId: 'u1', total: 99, ts: Date.now() });

profileNode.get('name').once((name) => console.log(name));
const orders = await orderRel.page({ limit: 20, reverse: true });
console.log(orders.items);
await orderRel.delete(orders.items[0].id);
```

### Real‑time subscriptions

```javascript
const gun = Gun();
const messageRel = gun.rel('messages', { primary: 'id', autoInc: true });

const page = await messageRel.page({ limit: 20, reverse: true });
const latest = page.items.length ? page.items[0].id : 0;

gun.get('rel:messages:idx:primary').map().on((link, key) => {
  if (!key || key.indexOf('id:') !== 0) return;
  const id = parseInt(String(key).slice(3), 10);
  if (!link || !link['#'] || id <= latest) return;
  gun.get(link['#']).once((data) => {
    console.log('new row', data);
  });
});
```

## Relational container inside the graph

The following sketch shows a relational container mounted inside the graph. You can think of `graph/app/rel-container` as a container that owns the `rel:*` namespace.

```
graph
└─ app
   ├─ profile
   │  └─ name = "Alice"
   └─ rel-container
      ├─ rel:orders            (table metadata)
      ├─ rel:orders:seq        (auto-increment sequence)
      ├─ rel:orders:row:1      (row data)
      ├─ rel:orders:idx:primary
      └─ rel:orders:idx:userId
```
