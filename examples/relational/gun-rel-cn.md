# gun.rel 关系型数据 API 说明

## 为什么需要这个 API

GUN 的图结构天生适合分布式协同，但当业务需要“按主键排序”“稳定分页”“快速定位某个字段”的场景时，直接用图遍历会变复杂且性能不可控。`gun.rel` 提供一层轻量的关系型抽象，把“表、主键、索引、分页”映射为图节点和关系链接，让数据既保持 GUN 的分布式特性，又能像关系表一样高效分页与查询。

## gun.rel 解决了哪些问题

- **稳定分页**：按自增主键排序分页，不受节点写入顺序影响。
- **快速定位**：通过索引节点实现对指定字段的快速定位。
- **结构化写入**：统一处理主键、索引、序列号的写入，避免手写约定。
- **可组合**：关系结构仍落在图上，可与现有 GUN API 组合使用。

## 与其他 API 是否会产生冲突

**不会产生冲突**，因为 `gun.rel` 使用固定命名空间 `rel:*` 存储元数据、索引与行节点，且通过 `rel` 链路写入。  同时可以与其他 GUN API 组合使用，不会干扰到图的其他部分。
**gun.rel使用时需要注意的场景**：
- 在私有环境中建议和gun.user配合使用，防止第三方篡改。
- `rel:*` 元数据/索引/序列已内置结构校验，写入不符合结构会直接返回错误。
- `rel:*` 索引节点只允许写入关系链接或删除标记，其他类型会被拒绝。
- schema 只允许首次初始化，后续对主键/索引等字段的变更会返回错误，若需变更请新建表名并迁移。

## gun.rel 实现原理

- **Schema 元数据写入**  
  在首次使用时把“表结构定义”写到固定命名空间里，让所有客户端都能读取到表的主键、索引等信息。
- **自增序列**  
  用一个独立的序列节点保存当前最大 id，每次插入先读序列再加一，保证主键单调递增。
- **索引写入**  
  每次插入或更新时同步写“主键索引”和“二级索引”，索引的值是指向行节点的引用。
- **分页读取**  
  分页时只扫描索引 key 的范围，而不是扫描整张表，从而拿到固定数量的行并保持顺序。

## 数据结构说明

以 `name = messages` 为例：

- 元信息：`rel:messages`  
  保存 schema 信息（主键、索引字段等）。
- 自增序列：`rel:messages:seq`  
  子字段 `value` 为当前序列值。
- 行节点：`rel:messages:row:<id>`  
  存储一行数据，包含主键字段。
- 主键索引：`rel:messages:idx:primary`  
  key 形如 `id:0000000001`，值为 `{'#': '<rowSoul>'}`。
- 二级索引：`rel:messages:idx:<field>`  
  key 形如 `<field>:<value>:0000000001`，值为 `{'#': '<rowSoul>'}`。

## gun.rel 子 API 清单

- `gun.rel(name, schema)`：创建关系型链路与表定义（内部会调用 relSchema）
- `gun.rel().relSchema(schema)`：单独初始化表结构元信息（仅首次生效，用于分步配置或延迟初始化）
- `gun.rel().insert(row)`：插入一行并返回 `{ id, soul }`
- `gun.rel().upsert(id, row)`：按主键更新一行
- `gun.rel().delete(id)`：按主键删除一行
- `gun.rel().page({ startId, limit, reverse })`：按主键分页读取

## gun.rel 使用示例

```javascript
const gun = Gun(); // 初始化 Gun 实例

const messageRel = gun.rel('messages', { // 创建关系型表（建表）
  type: 'rel', // 声明关系型结构
  name: 'messages', // 表名
  primary: 'id', // 主键字段
  autoInc: true, // 主键自增
  indexes: ['ts', 'from'] // 二级索引字段
}); // 完成建表配置

const res = await messageRel.insert({ // 新增一条数据
  from: 'pubA', // 发送者字段
  text: 'hello', // 文本字段
  ts: Date.now() // 时间字段
}); // 返回包含新 id 的结果

await messageRel.upsert(res.id, { // 更新指定 id 的数据
  from: 'pubA', // 更新发送者字段
  text: 'hello world', // 更新文本字段
  ts: Date.now() // 更新发布时间
}); // 完成更新

await messageRel.delete(res.id); // 删除指定 id 的数据

const page = await messageRel.page({ limit: 20, reverse: true }); // 分页读取最新 20 条
console.log(page.items); // 输出查询结果
```

## 与其他 API 一起使用的示例

### 与 SEA 加密结合

```javascript
const gun = Gun(); // 初始化 Gun 实例
const messageRel = gun.rel('messages', { primary: 'id', autoInc: true, indexes: ['ts'] }); // 建表并配置索引

const pair = await Gun.SEA.pair(); // 生成用户密钥对
const secret = await Gun.SEA.secret(pair.epub, pair); // 生成加密密钥
const cipher = await Gun.SEA.encrypt('secret message', secret); // 加密消息内容

await messageRel.insert({ // 新增加密消息
  from: pair.pub, // 发送者公钥
  cipher, // 加密文本
  ts: Date.now() // 时间戳
}); // 完成插入

const page = await messageRel.page({ limit: 20, reverse: true }); // 分页取最新消息
const text = await Gun.SEA.decrypt(page.items[0].cipher, secret); // 解密消息内容
console.log(text); // 输出明文
```

### 与 gun.get / gun.put 组合使用

```javascript
const gun = Gun(); // 初始化 Gun 实例
const root = gun.get('app'); // 获取根节点
const dbNode = root.get('rel-container'); // 在图节点里创建关系容器位置
const messageRel = dbNode.rel('messages', { primary: 'id', autoInc: true, indexes: ['ts', 'from'] }); // 在子节点里建表

await messageRel.insert({ from: 'pubA', text: 'hi', ts: Date.now() }); // 新增一条关系型数据
const page = await messageRel.page({ limit: 10, reverse: true }); // 查询最新 10 条

gun.get('rel:messages:row:' + page.items[0].id).put({ text: 'edit via put' }); // 使用原生 put 更新行节点
gun.get('rel:messages:row:' + page.items[0].id).once((data) => console.log(data)); // 使用原生 get 读取行节点
await messageRel.delete(page.items[0].id); // 使用关系型 API 删除一条数据
```

### 与原生图形数据结构组合使用

```javascript
const gun = Gun(); // 初始化 Gun 实例
const graphRoot = gun.get('graph'); // 获取图根节点
const appNode = graphRoot.get('app'); // 应用节点
const profileNode = appNode.get('profile'); // 用户资料子节点
profileNode.put({ name: 'Alice', role: 'admin' }); // 原生图结构写入

const relContainer = appNode.get('rel-container'); // 在图结构中创建关系容器
const orderRel = relContainer.rel('orders', { primary: 'id', autoInc: true, indexes: ['userId', 'ts'] }); // 在容器内建表
await orderRel.insert({ userId: 'u1', total: 99, ts: Date.now() }); // 关系型数据写入

profileNode.get('name').once((name) => console.log(name)); // 原生图读取
const orders = await orderRel.page({ limit: 20, reverse: true }); // 关系型分页读取
console.log(orders.items); // 输出关系型结果
await orderRel.delete(orders.items[0].id); // 删除关系型数据中的指定行
```

### 与实时订阅结合

```javascript
const gun = Gun(); // 初始化 Gun 实例
const messageRel = gun.rel('messages', { primary: 'id', autoInc: true }); // 建表

const page = await messageRel.page({ limit: 20, reverse: true }); // 先加载一页历史消息
const latest = page.items.length ? page.items[0].id : 0; // 记录已加载的最大 id

gun.get('rel:messages:idx:primary').map().on((link, key) => { // 订阅主键索引的变化
  if (!key || key.indexOf('id:') !== 0) return; // 过滤非主键索引项
  const id = parseInt(String(key).slice(3), 10); // 从索引 key 解析出 id
  if (!link || !link['#'] || id <= latest) return; // 只处理新增的记录
  gun.get(link['#']).once((data) => { // 根据 link 读取行数据
    console.log('new row', data); // 处理新增行
  }); // 完成一次读取
}); // 完成订阅
```

## 图结构中的关系型容器示意

下面是一个“图结构中挂载关系型容器”的示意，这个容器像是“在图数据库中的一个子节点里，创建了关系型表结构”。  
可以理解为：`graph/app/rel-container` 是一个“关系型容器”，容器内部维护 `rel:*` 命名空间的数据结构。

```
graph
└─ app
   ├─ profile
   │  └─ name = "Alice"
   └─ rel-container
      ├─ rel:orders            (表元信息)
      ├─ rel:orders:seq        (自增序列)
      ├─ rel:orders:row:1      (行数据)
      ├─ rel:orders:idx:primary
      └─ rel:orders:idx:userId
```
