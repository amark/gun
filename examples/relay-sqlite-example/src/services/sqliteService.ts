import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, capSQLiteUpgradeOptions } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface ISQLiteService {
    getPlatform(): string
    initWebStore(): Promise<void>
    addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void> 
    openDatabase(dbName: string, loadToVersion: number, readOnly: boolean): Promise<SQLiteDBConnection> 
    closeDatabase(dbName: string, readOnly: boolean): Promise<void>
    saveToStore(dbName: string): Promise<void>
    saveToLocalDisk(dbName: string): Promise<void>
    isConnection(dbName: string, readOnly: boolean): Promise<boolean>
};

class SQLiteService implements ISQLiteService {
    platform = Capacitor.getPlatform();
    sqlitePlugin = CapacitorSQLite;
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    dbNameVersionDict: Map<string, number> = new Map();

    getPlatform(): string {
        return this.platform;
    }
    async initWebStore() : Promise<void>  {
        try {
            await this.sqliteConnection.initWebStore();
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.initWebStore: ${msg}`);
        }
        return;
    }
    async addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void> {
        try {
            await this.sqlitePlugin.addUpgradeStatement(options);
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.addUpgradeStatement: ${msg}`);
        }
        return;
    }
    async openDatabase(dbName:string, loadToVersion: number,
                readOnly: boolean): Promise<SQLiteDBConnection>  {
        this.dbNameVersionDict.set(dbName, loadToVersion);
        let encrypted = false;
        const mode = encrypted ? "secret" : "no-encryption";
        try {
            let db: SQLiteDBConnection;
            const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
            let isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if(retCC && isConn) {
              db = await this.sqliteConnection.retrieveConnection(dbName, readOnly);
            } else {
                db = await this.sqliteConnection
                        .createConnection(dbName, encrypted, mode, loadToVersion, readOnly);
            }
            const jeepSQlEL = document.querySelector("jeep-sqlite")
      
            await db.open();
            const res = await db.isDBOpen();
            return db;
          
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.openDatabase: ${msg}`);
        }

    }
    async isConnection(dbName:string, readOnly: boolean): Promise<boolean> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if (isConn != undefined) {
                return isConn
            } else {
                throw new Error(`sqliteService.isConnection undefined`);
            }
        
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.isConnection: ${msg}`);
        }
    }
    async closeDatabase(dbName:string, readOnly: boolean):Promise<void> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if(isConn) {
                await this.sqliteConnection.closeConnection(dbName, readOnly);
            }
            return;
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.closeDatabase: ${msg}`);
        }
    }
    async saveToStore(dbName: string): Promise<void> {
        try {
            await this.sqliteConnection.saveToStore(dbName);
            return;
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.saveToStore: ${msg}`);
        }
    }
    async saveToLocalDisk(dbName: string): Promise<void> {
        try {
            await this.sqliteConnection.saveToLocalDisk(dbName);
            return;
        } catch(err:any) {
            const msg = err.message ? err.message : err;
            throw new Error(`sqliteService.saveToLocalDisk: ${msg}`);
        }
    }
}
export default SQLiteService;
