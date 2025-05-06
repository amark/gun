import { ref, Ref } from 'vue';
import { Flint, NodeAdapter } from 'gun-flint';
import StorageService from '../services/storageService';
import { ISQLiteService } from '../services/sqliteService';
import { IDbVersionService } from '../services/dbVersionService';

// 日志工具
// const log = {
//   debug: (msg: string, ...args: any[]) => console.debug(`[Gun-SQLite-Adapter] ${msg}`, ...args),
//   info: (msg: string, ...args: any[]) => console.info(`[Gun-SQLite-Adapter] ${msg}`, ...args),
//   warn: (msg: string, ...args: any[]) => console.warn(`[Gun-SQLite-Adapter] ${msg}`, ...args),
//   error: (msg: string, ...args: any[]) => console.error(`[Gun-SQLite-Adapter] ${msg}`, ...args),
// };

// 请求队列管理，防止重复查询
class RequestQueue {
  private queue: Map<string, { resolve: (data: any) => void; reject: (err: any) => void }[]> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private storageServ: StorageService;

  constructor(storageServ: StorageService) {
    this.storageServ = storageServ;
  }

  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const handlers = this.queue.get(key) || [];
      handlers.push({ resolve, reject });
      this.queue.set(key, handlers);

      if (!this.debounceTimers.has(key)) {
        const timer = setTimeout(async () => {
          const handlers = this.queue.get(key) || [];
          this.queue.delete(key);
          this.debounceTimers.delete(key);

          try {
            if (!this.storageServ.db) throw new Error('Database connection not available');
            const result = await this.storageServ.query('SELECT value FROM gun_nodes WHERE key = ?', [key]);
            const data = result.values && result.values.length > 0 ? JSON.parse(result.values[0].value) : null;
            handlers.forEach(h => h.resolve(data));
          } catch (err) {
            //log.error(`Failed to get key=${key}:`, err);
            handlers.forEach(h => h.reject(err));
          }
        }, 50);
        this.debounceTimers.set(key, timer);
      }
    });
  }

  async put(soul: string, node: any): Promise<void> {
    await this.storageServ.run(
      'INSERT OR REPLACE INTO gun_nodes (key, value, timestamp) VALUES (?, ?, ?)',
      [soul, JSON.stringify(node), Date.now()]
    );
  }

  async batchPut(nodes: Record<string, any>): Promise<void> {
    const updates: [string, string, number][] = [];
    for (const soul in nodes) {
      updates.push([soul, JSON.stringify(nodes[soul]), Date.now()]);
    }
    await this.storageServ.run(
      'INSERT OR REPLACE INTO gun_nodes (key, value, timestamp) VALUES ' + updates.map(() => '(?, ?, ?)').join(','),
      updates.flat()
    );
  }
}

// 定义适配器接口
interface GunAdapter {
  opt?: (context: any, options: any) => void;
  get: (key: string, done: (err: Error | null, node: any) => void) => void;
  put: (node: any, done: (err: Error | null) => void) => void;
}

export interface IGunSQLiteAdapter {
  initialize(): Promise<void>;
  getAdapter(): GunAdapter;
  isReady: Ref<boolean>;
}

// 单例实例
let instance: IGunSQLiteAdapter | null = null;

export function useGunSQLiteAdapter(
  sqliteService: ISQLiteService,
  dbVersionService: IDbVersionService,
  storageService: StorageService
): IGunSQLiteAdapter {
  if (instance) return instance;

  const isReady: Ref<boolean> = ref(false);
  const storageServ = storageService;
  let queue: RequestQueue | null = null;

  async function initialize() {
    if (isReady.value) return;
    try {
      //log.info('Initializing Gun SQLite adapter...');
      // 检查 StorageService 是否已初始化数据库
      if (!storageServ.db) {
        //log.warn('StorageService database not initialized, initializing now...');
        const dbName = 'talkflowdb';
        const loadToVersion = storageServ.loadToVersion || 2;
        storageServ.db = await sqliteService.openDatabase(dbName, loadToVersion, false);
      } else {
        const isOpen = await storageServ.db.isDBOpen();
        if (!isOpen) {
          //log.warn('Database not open, reopening...');
          await storageServ.db.open();
        }
      }

      // 创建 gun_nodes 表
      const result = await storageServ.execute(`
        CREATE TABLE IF NOT EXISTS gun_nodes (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          timestamp INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `);
      if (result.changes && result.changes.changes >= 0) {
        //log.info('gun_nodes table created or already exists');
      } else {
        throw new Error('Failed to create gun_nodes table: no changes returned');
      }

      queue = new RequestQueue(storageServ);
      isReady.value = true;
      //log.info('Gun SQLite adapter initialized successfully');
    } catch (err) {
      //log.error('Failed to initialize Gun SQLite adapter:', err);
      throw err;
    }
  }

  const adapterCore = {
    storageServ,
    queue,
    opt: async function (context: any, options: any) {
     // log.info('Adapter opt called:', { context, options });
      await initialize();
      return options;
    },
    get: async function (key: string, done: (err: Error | null, node: any) => void) {
      try {
        if (!isReady.value) await initialize();
        if (!queue) throw new Error('Adapter not initialized');
        const data = await queue.get(key);
        done(null, data);
      } catch (err) {
        //log.error(`Get error for key=${key}:`, err);
        done(err instanceof Error ? err : new Error('Unknown error'), null);
      }
    },
    put: async function (node: any, done: (err: Error | null) => void) {
      try {
        if (!isReady.value) await initialize();
        if (!queue) throw new Error('Adapter not initialized');
        if (typeof node !== 'object' || node === null) throw new Error('Invalid node');
        const souls = Object.keys(node).length > 1 ? Object.keys(node) : [node._?.['#'] || node._.id];
        if (!souls[0]) throw new Error('Missing soul in node');
        if (souls.length > 1) {
          await queue.batchPut(node);
        } else {
          await queue.put(souls[0], node[souls[0]] || node);
        }
        done(null);
      } catch (err) {
        //log.error('Put error:', err);
        done(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
  };

  const adapter = new NodeAdapter(adapterCore);
  Flint.register(adapter);

  const gunSQLiteAdapter: IGunSQLiteAdapter = {
    initialize,
    getAdapter: () => adapter,
    isReady,
  };

  instance = gunSQLiteAdapter;
  return gunSQLiteAdapter;
}

export function getGunSQLiteAdapter(
  sqliteService: ISQLiteService,
  dbVersionService: IDbVersionService,
  storageService: StorageService
): IGunSQLiteAdapter {
  if (!instance) {
    instance = useGunSQLiteAdapter(sqliteService, dbVersionService, storageService);
  }
  return instance;
}

export default getGunSQLiteAdapter;