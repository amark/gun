export interface IDbVersionService {
    setDbVersion(dbName: string, version: number): void
    getDbVersion(dbName: string):number| undefined
};
class DbVersionService implements IDbVersionService {
    dbNameVersionDict: Map<string, number> = new Map();
  
    setDbVersion(dbName: string, version: number) {
      this.dbNameVersionDict.set(dbName, version);
      console.log(`设置数据库 ${dbName} 版本为: ${version}`);
    }
  
    getDbVersion(dbName: string): number | undefined {
      const version = this.dbNameVersionDict.get(dbName);
      console.log(`获取数据库 ${dbName} 版本: ${version}`);
      return version;
    }
  }
export default DbVersionService;