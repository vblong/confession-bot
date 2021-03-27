const sqlite3 = require('sqlite3').verbose();
const cf = require("../config");
const mysql = require('mysql');
const main = require('../main');
import { correctString } from '../utils/string-preprocessor';

import { create } from 'ts-node';
import { DatabaseList } from '../config';
import { create_table_queries } from './dt_queries';
import { config } from '../main';

export class DBControl {
    private db: any;
    constructor() {}

    connect() {
        let result: boolean = true;
        this.db = mysql.createConnection({
            host: config.MySQL.ip,
            user: config.MySQL.username,
            password: config.MySQL.password,
            database: config.MySQL.database_name,
            charset : 'utf8mb4'
        });
    
        this.db.connect((err: any) => {
            if(err) {
                console.log("MySQLERR", err);
                result = false;
            }
            console.log("MySQL Connected");
        });        

        return result;
    }

    close() {
        let result: boolean = true;
        this.db.end(function(err: any) {
            if (err) {
                console.log('MySQLErr:' + err.message);
                result = false; 
            }
            console.log('Close the database connection.');
        });
        return result;
    }

    createDBTables() {
        console.log("Checking DB tables...");
        for (let i in create_table_queries) {
            this.query(create_table_queries[i]);
        }
    }

    /**
     * @param query 
     * @returns 
     * Does not return Promise
     * Use for update DB
     */
    query(query: string) {
        let result: boolean = true;
        if(this.connect() === false) {
            console.error("Failed to connect to the database");
            return false;
        }

        this.db.query(query, (err: any, rows: any, fields: any) => {
            if(err) {
                console.log(`Error while running query ${query}`);
                console.error(err);
                result = false;
            }
        });
        
        if(this.close() === false){
            console.log("Failed to disconnect to the database");
            return false;
        }

        return result;
    }

    /**
     * @param query 
     * @returns 
     * Return a Promise, use when retrieving data
     */
    queryP(query: string) {
        return new Promise((resolve, reject) => {
            if(this.connect() === false) {
                reject("Failed connecting to database");
            }
            this.db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log(`MySQLERR ${err}`);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
            if(this.close() === false) {
                reject("Failed closing connection to database");
            }
        });
    }

    getServersFromDB() {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM servers";
            this.queryP(query)
            .then((result: any) => {
                resolve(result);
            })
            .catch((err: any) => {
                reject(err);
            });            
        });
    }

    getUsedPrefixes() {
        return new Promise((resolve, reject) => {
            let query = "SELECT prefix from servers";
            this.queryP(query)
            .then((result: any) => {
                resolve(result);
            })
            .catch((err: any) => {
                reject(err);
            });
        });
    }

    
    saveServerOnDB(server: any) {
        let query: string = `INSERT INTO servers (serverID, ownerID, serverName, prefix)
        VALUES("${server.serverID}","${server.ownerID}","${server.serverName}","${server.prefix}");`
        this.query(query);
    }

    saveMsgData(msg: any) {
        msg.content = correctString(msg.content);    
        msg.authorName = correctString(msg.authorName);
        msg.serverName = correctString(msg.serverName);
        msg.channelName = correctString(msg.channelName);
    
        let query = `INSERT INTO msg_data (content, authorName, authorID, serverName, serverID, channelID, channelName, discordMsgID, createdTime)
        VALUES ('${msg.content}', '${msg.authorName}','${msg.authorID}', '${msg.serverName}', '${msg.serverID}', '${msg.channelID}', '${msg.channelName}', '${msg.discordMsgID}','${msg.createdTime}');
        `;
        this.query(query);
    }

    async getConfessionPendingID(serverID: string) {
        return new Promise((resolve, reject) => {
            let query = `SELECT confessionPendingID as ID FROM servers where serverID = ${serverID} ORDER BY confessionPendingID DESC LIMIT 1;`;
            this.queryP(query)
            .then((result: any) => {
                resolve(result);
            })
            .catch((err: any) => {
                reject(err);
            });
        });
    }  
    
    saveConfession(cfs: any) {
        cfs.authorName = correctString(cfs.authorName);
        cfs.content = correctString(cfs.content);
    
        let query = `INSERT INTO confessions (authorName, authorID, discordMsgID, serverID, content, confessionID, approved, confessionRepID)
        VALUES ('${cfs.authorName}','${cfs.authorID}','${cfs.discordMsgID}','${cfs.serverID}','${cfs.content}',${cfs.confessionID},${cfs.approved},${cfs.confessionRepID});
        `;
        this.query(query);
    }

    async getConfessionChannelID(serverID: string) {
        return new Promise((resolve, reject) => {
            let query = `SELECT confessionChannelID as ID FROM servers where serverID = ${serverID} ORDER BY confessionChannelID DESC LIMIT 1;`;
            this.queryP(query)
            .then((result: any) => {
                resolve(result);
            })
            .catch((err: any) => {
                reject(err);
            });
        });
    } 

    async getHighestConfessionId(serverID: string) {
        return new Promise((resolve, reject) => {
            let query = `SELECT confessionID as ID FROM confessions where serverID = ${serverID} ORDER BY confessionID DESC LIMIT 1;`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }

    updateServerCFSIDOnDB(server: any) {
        let query: string = `UPDATE servers
        SET confessionChannelID = '${server.confessionChannelID}'
        WHERE servers.serverID = '${server.serverID}'`;
        return this.query(query);
    }

    updateServerPendingCFSIDOnDB(server: any) {
        let query: string = `UPDATE servers
        SET confessionPendingID = '${server.confessionPendingID}'
        WHERE servers.serverID = '${server.serverID}'`;
        return this.query(query);
    }

    getConfessionInfoByMsgID(messageID: string, column: string) {
        return new Promise((resolve, reject) => {
            let query = `SELECT ${column} from confessions where discordMsgID = '${messageID}'`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }

    async getConfession(cfsNr: any) {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM confessions where confessionID = ` + cfsNr+ ` LIMIT 1;`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }

    getConfessionIDByMessageID(messageID: string) {    
        return new Promise((resolve, reject) => {
            let query = `SELECT id from confessions where discordMsgID = '${messageID}'`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }

    approveConfession(confessionObj: any) {
        return new Promise(async (resolve, reject) => {
            let dbRecordID: any = await this.getConfessionIDByMessageID(confessionObj.messageID);
            let query = `UPDATE confessions SET approved = 1, confessionID = '${confessionObj.confessionID}', discordMsgID = '${confessionObj.discordMsgID}' where id = ${dbRecordID[0].id}`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }

    denyConfession(confessionObj: any) {
        return new Promise((resolve, reject) => {
            let query = `UPDATE confessions SET approved = 0, confessionID = -1 where discordMsgID = ${confessionObj.messageID}`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }

    getConfessionRepID(messageID: string) {
        return new Promise((resolve, reject) => {
            let query = `SELECT id from confessions where discordMsgID = '${messageID}'`;
            this.queryP(query)
            .then((result: any) => { resolve(result); })
            .catch((err: any) => { reject(err); });
        });
    }
}