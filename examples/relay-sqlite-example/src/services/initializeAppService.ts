import {ISQLiteService } from '../services/sqliteService'; 
import {IStorageService } from '../services/storageService'; 

export interface IInitializeAppService {
    initializeApp(): Promise<boolean>
};

class InitializeAppService implements IInitializeAppService  {
    appInit = false;
    sqliteServ!: ISQLiteService;
    storageServ!: IStorageService;
    platform!: string;
  static platform: string;

    constructor(sqliteService: ISQLiteService, storageService: IStorageService) {
        this.sqliteServ = sqliteService;
        this.storageServ = storageService;
        this.platform = this.sqliteServ.getPlatform();
    }
    async initializeApp(): Promise<boolean> {
        if (!this.appInit) {
          try {
            console.log('开始应用初始化');
            if (this.platform === 'web') {
              await this.sqliteServ.initWebStore();
              console.log('Web 存储初始化完成');
            }
            await this.storageServ.initializeDatabase();
            console.log('数据库初始化完成');
            // if (this.platform === 'web') {
            //   await this.sqliteServ.saveToStore(this.storageServ.getDatabaseName());
            //   console.log('数据库保存到 Web 存储完成');
            // }
            this.appInit = true;
            console.log('应用初始化成功');
          } catch (error: any) {
            const msg = error.message ? error.message : error;
            console.error(`initializeAppError.initializeApp: ${msg}`, error);
            throw new Error(`initializeAppError.initializeApp: ${msg}`);
          }
        }
        return this.appInit;
      }
}
export default InitializeAppService;
