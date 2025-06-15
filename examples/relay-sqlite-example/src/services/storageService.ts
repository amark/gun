import { BehaviorSubject } from 'rxjs';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { getCurrentInstance } from 'vue';
import { ISQLiteService } from './sqliteService';
import { IDbVersionService } from './dbVersionService';


export interface IStorageService {
  initializeDatabase(): Promise<void>;


  query(sql: string, params?: any[]): Promise<any>;
  run(sql: string, params?: any[]): Promise<any>;
  execute(sql: string): Promise<any>;

}

class StorageService implements IStorageService {
  versionUpgrades = [
   
    {
      toVersion: 1,
      statements: [
      
        `CREATE TABLE IF NOT EXISTS network_peers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT UNIQUE,
          is_enabled INTEGER DEFAULT 0,
          note TEXT DEFAULT ''
        );`,
      
        `CREATE TABLE IF NOT EXISTS gun_nodes (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          timestamp INTEGER DEFAULT (strftime('%s', 'now'))
        );`,
        
  




      ],
    },
  ];


  loadToVersion = 1;
  momentsVersion = 2;
  db!: SQLiteDBConnection;
  database: string = 'gundb';
  sqliteServ!: ISQLiteService;
  dbVerServ!: IDbVersionService;
  isInitCompleted = new BehaviorSubject(false);
  appInstance = getCurrentInstance();
  platform!: string;
  private isInitialized = false;

  constructor(sqliteService: ISQLiteService, dbVersionService: IDbVersionService) {
    this.sqliteServ = sqliteService;
    this.dbVerServ = dbVersionService;
    this.platform = this.appInstance?.appContext.config.globalProperties.$platform || 'web';
  }

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) {
      console.log('数据库已初始化，跳过重复调用');
      return;
    }

    try {
      console.log('开始初始化数据库:', this.database);
      await this.sqliteServ.addUpgradeStatement({
        database: this.database,
        upgrade: this.versionUpgrades,
      });
      console.log('核心升级语句已添加');

      this.db = await this.sqliteServ.openDatabase(this.database, this.loadToVersion, false);
      console.log('数据库已打开，目标版本:', this.loadToVersion);

      const currentVersionResult = await this.db.getVersion();
      const currentVersion: number = currentVersionResult.version ?? 0;
      console.log('当前数据库版本:', currentVersion);

      for (const upgrade of this.versionUpgrades) {
        console.log(`执行核心升级到版本 ${upgrade.toVersion}`);
        for (const stmt of upgrade.statements) {
          try {
            await this.db.execute(stmt);
            console.log('执行语句成功:', stmt);
          } catch (err) {
            console.error('执行语句失败:', stmt, err);
            throw err;
          }
        }
      }
      this.dbVerServ.setDbVersion(this.database, this.loadToVersion);
      console.log('核心数据库版本已设置为:', this.loadToVersion);

    

      if (this.platform === 'web') {
        try {
          await this.sqliteServ.saveToStore(this.database);
          console.log('数据库已保存到 Web 存储');
        } catch (err) {
          console.warn('Web 存储保存失败（非致命错误）:', err);
        }
      }

      const tablesAfter = await this.db.query("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('初始化后的表:', tablesAfter.values);
      this.isInitCompleted.next(true);
      this.isInitialized = true;
      console.log('SQLite 数据库初始化成功');
    } catch (error: any) {
      console.error(`storageService.initializeDatabase: ${error.message || error}`, error);
      throw new Error(`storageService.initializeDatabase: ${error.message || error}`);
    }
  }
  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      return await this.db.query(sql, params);
    } catch (err) {
      console.error(`执行查询 ${sql} 失败:`, err);
      throw err;
    }
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    try {
      return await this.db.run(sql, params);
    } catch (err) {
      console.error(`执行语句 ${sql} 失败:`, err);
      throw err;
    }
  }

  async execute(sql: string): Promise<any> {
    try {
      return await this.db.execute(sql);
    } catch (err) {
      console.error(`执行语句 ${sql} 失败:`, err);
      throw err;
    }
  }
}

export default StorageService;



