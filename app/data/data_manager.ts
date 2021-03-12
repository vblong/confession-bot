const sqlite3 = require('sqlite3').verbose();
const cf = require("../config");
const mysql = require('mysql');
const main = require('../main');
import { correctString } from '../utils/string-preprocessor';

import { create } from 'ts-node';
import { DatabaseList } from '../config';
import { create_table_queries } from './dt_queries';

export function createMySQLTbls() {
    let conn = mysql.createConnection({
        host: cf.MySQLConfig.ip,
        user: cf.MySQLConfig.username,
        password: cf.MySQLConfig.password,
        database: cf.MySQLConfig.database_name,
        charset : 'utf8mb4'
    });

    conn.connect((err: any) => {
        if(err) {
            console.log("MySQLERR", err);
            return;
        }
        console.log("MySQL Connected");
    });

    for (let i in create_table_queries) {
        conn.query(create_table_queries[i], (err: any, res: any, fields: any) => {
            if(err) {
                console.log("MySQLERRR", err);
                return;
            }
            console.log("Query succeed");
        });
    }

    conn.end(function(err: any) {
        if (err) {
          console.log('MySQLErr:' + err.message);
          return 
        }
        console.log('Close the database connection.');
    });
}

export function connect() {
    let db: any;

    if(cf.Database === cf.DatabaseList.MySQL) {
        db = mysql.createConnection({
            host: cf.MySQLConfig.ip,
            user: cf.MySQLConfig.username,
            password: cf.MySQLConfig.password,
            database: cf.MySQLConfig.database_name,
            charset : 'utf8mb4'
        });

        db.connect((err: any) => {
            if(err) {
                console.log("MySQLERR", err);
                return;
            }
            console.log("MySQL Connected");
        });
    } else if(cf.Database === cf.DatabaseList.SQLite) {        
        db = new sqlite3.Database(cf.appDataPath + cf.sqliteFileName, (err: any) => {
            if (err) {
                console.error("SQSLite3ERR", err);
                return;
            }
            console.log('SQLite3 connected.');
        });
    }
    return db;
}

export async function query() {
    let db = await connect();
    
    let query = "SELECT * FROM servers";
    await db.serialize(() => {
        db.each(query, (err: any, row: any) => {
            if(err) {
                console.log(err);
            } else {
                console.log(row);
            }
        });
    });

    close(db); 
}

export async function getServers() {
    return new Promise((resolve, reject) => {
        let db = connect();
        let query = "SELECT * FROM servers";
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.log(`SQLITE is no more supported`);
        }

        close(db);
    })
}

export function saveConfession(
    authorName: string,
    authorID: string, 
    discordMsgID: string, 
    serverID: string, 
    content: string,
    confessionID: number,
    approved: boolean = true,
    confessionRepID: number = -1) {
    let db = connect();

    authorName = correctString(authorName);
    content = correctString(content);

    let queryMySQL = `INSERT INTO confessions (authorName, authorID, discordMsgID, serverID, content, confessionID, approved, confessionRepID)
    VALUES ('${authorName}','${authorID}','${discordMsgID}','${serverID}','${content}',${confessionID},${approved},${confessionRepID});
    `;
    if(cf.Database === cf.DatabaseList.MySQL) {
        db.query(queryMySQL, (err: any, rows: any, fields: any) => {
            if(err) {
                console.log("Error while inserting confession to DB", err)
            } else {
                main.startingConfessionId = main.startingConfessionId + 1;
            }
        });
    } else if(cf.Database === cf.DatabaseList.SQLite) {
        console.log("SQLIte is no longer supported");
    }
    close(db);
}

export function saveMsgData(
    content: string, 
    authorName: string, 
    authorID: string,
    serverName: string,
    serverID: string,
    channelID: string,
    channelName: string,    
    discordMsgID: string,
    createdTime: string) {

    let db = connect();

    content = correctString(content);    
    authorName = correctString(authorName);
    serverName = correctString(serverName);
    channelName = correctString(channelName);

    let querySQLITE = `INSERT INTO confessions (authorName, authorID, discordMsgId, serverID, content)
    VALUES (?, ?, ?, ?, ?, ?);`;
    let queryMySQL = `INSERT INTO msg_data (content, authorName, authorID, serverName, serverID, channelID, channelName, discordMsgID, createdTime)
    VALUES ('${content}', '${authorName}','${authorID}', '${serverName}', '${serverID}', '${channelID}', '${channelName}', '${discordMsgID}','${createdTime}');
    `;
    if(cf.Database === cf.DatabaseList.MySQL) {
        db.query(queryMySQL, (err: any, rows: any, fields: any) => {
            if(err) {
                console.log("Error while inserting confession to DB", err)
            } else {
                main.startingConfessionId = main.startingConfessionId + 1;
            }
        });
    } else if(cf.Database === cf.DatabaseList.SQLite) {
        console.error("saveMsgData is not yet implemented on SQLite database");
    }
    close(db);
}

export function runQuery(query: string) {
    let db = connect();
    if(cf.Database === cf.DatabaseList.MySQL) {
        db.query(query, (err: any, rows: any, fields: any) => {
            if(err) {
                console.log("Error while running query", query);
                console.error(err);
                return false;
            }
            return true;
        });
    } else if(cf.Database === cf.DatabaseList.SQLite) {
        console.log("SQLite runQuery is not supported");
    }
    close(db);
    return true;
}
export function saveServerOnDB(server: any) {
    let query: string = `INSERT INTO servers (serverID, ownerID, serverName, prefix)
    VALUES("${server.serverID}","${server.ownerID}","${server.serverName}","${server.prefix}");`
    runQuery(query);
}

export function updateServerCFSIDOnDB(server: any) {
    let query: string = `UPDATE servers
    SET confessionChannelID = '${server.confessionChannelID}'
    WHERE servers.serverID = '${server.serverID}'`;
    return runQuery(query);
}

export function updateServerPendingCFSIDOnDB(server: any) {
    let query: string = `UPDATE servers
    SET confessionPendingID = '${server.confessionPendingID}'
    WHERE servers.serverID = '${server.serverID}'`;
    return runQuery(query);
}

export function close(db: any) {
    if(cf.Database === cf.DatabaseList.MySQL) {
        db.end(function(err: any) {
            if (err) {
              console.log('MySQLErr:' + err.message);
              return 
            }
            console.log('Close the database connection.');
        });
    } else if(cf.Database === DatabaseList.SQLite) {
        db.close((err: any) => {
            if (err) {
                console.error("SQLiteERR", err.message);
                return;
            }
            console.log('Close the database connection.');
        });
    }
}

export async function getConfessionId(cfsNr: any) {
    return new Promise((resolve, reject) => {
        let db = connect();

        let query = `SELECT * FROM confessions where confessionID = ` + cfsNr+ `;`;
        let cfs: any;

        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {
                    cfs = rows[0];
                    resolve(cfs);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            db.all(query, (err: any, rows: any) => {
                if(err) {
                    reject(err);
                } else {
                    cfs = rows[0];
                    resolve(cfs);
                }
            });
        }
        close(db);
    });
}
export async function getHighestConfessionId() {
    return new Promise((resolve, reject) => {
        let db = connect();
    
        let cfs: any = [];
        let query = "SELECT confessionID as ID FROM confessions ORDER BY confessionID DESC LIMIT 1;";
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {
                    cfs = rows[0];
                    if(rows.length === 0) cfs = {ID: 0};
                    resolve(cfs);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            db.serialize(async () => {
                db.each(query, [], (err: any, rows: any) => {
                    if(err) {
                        console.log(err);
                        reject(err);
                    } else {
                        cfs.push(rows);
                        if(rows.length === 0) cfs = {ID: 0};
                        resolve(cfs);
                    }
                    
                });
            });
        }

        close(db);
    })
}

export async function getConfessionChannelID() {
    return new Promise((resolve, reject) => {
        let db = connect();
    
        let cfs: any = [];
        let query = "SELECT confessionChannelID as ID FROM servers ORDER BY confessionChannelID DESC LIMIT 1;";
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {
                    cfs = rows[0];
                    if(rows.length === 0) cfs = {ID: '0'};
                    resolve(cfs);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            db.serialize(async () => {
                db.each(query, [], (err: any, rows: any) => {
                    if(err) {
                        console.log(err);
                        reject(err);
                    } else {
                        cfs.push(rows);
                        if(rows.length === 0) cfs = {ID: '0'};
                        resolve(cfs);
                    }
                    
                });
            });
        }

        close(db);
    })
} 

export async function getConfessionPendingID() {
    return new Promise((resolve, reject) => {
        let db = connect();
    
        let cfs: any = [];
        let query = "SELECT confessionPendingID as ID FROM servers ORDER BY confessionPendingID DESC LIMIT 1;";
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {
                    cfs = rows[0];
                    if(rows.length === 0) cfs = {ID: '0'};
                    resolve(cfs);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.log(`SQLITE is no longer supported`);
        }

        close(db);
    })
}   

export async function getUsedPrefixes() {
    return new Promise((resolve, reject) => {
        let db = connect();
    
        let prefixes: any = [];
        let query = "SELECT prefix from servers";
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.error(`SQLITE is not supported anymore`);
        }

        close(db);
    })
}

export function denyConfession(confessionObj: any) {
    return new Promise((resolve, reject) => {
        let db = connect();
    
        let query = `UPDATE confessions SET approved = 0, confessionID = -1 where discordMsgID = ${confessionObj.messageID}`;
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.error(`SQLITE is not supported anymore`);
        }

        close(db);
    });
}

export function approveConfession(confessionObj: any) {
    return new Promise(async (resolve, reject) => {
        let db = connect();
        let dbRecordID: any = await getConfessionIDByMessageID(confessionObj.messageID);
        let query = `UPDATE confessions SET approved = 1, confessionID = '${confessionObj.confessionID}', discordMsgID = '${confessionObj.discordMsgID}' where id = ${dbRecordID[0].id}`;
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.error(`SQLITE is not supported anymore`);
        }

        close(db);
    });
}

export function getConfessionIDByMessageID(messageID: string) {    
    return new Promise((resolve, reject) => {
        let db = connect();
        let query = `SELECT id from confessions where discordMsgID = '${messageID}'`;
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.error(`SQLITE is not supported anymore`);
        }
        close(db);
    });
}

export function getConfessionRepID(messageID: string) {
    return new Promise((resolve, reject) => {
        let db = connect();
        let query = `SELECT id from confessions where discordMsgID = '${messageID}'`;
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.error(`SQLITE is not supported anymore`);
        }
        close(db);
    });
}

export function getConfessionInfoByMsgID(messageID: string, column: string) {
    return new Promise((resolve, reject) => {
        let db = connect();
        let query = `SELECT ${column} from confessions where discordMsgID = '${messageID}'`;
        if(cf.Database === cf.DatabaseList.MySQL) {
            db.query(query, (err: any, rows: any, fields: any) => {
                if(err) {
                    console.log("MySQLERRR", err);
                    reject(err);
                } else {                    
                    resolve(rows);
                }
            });
        } else if(cf.Database === cf.DatabaseList.SQLite) {
            console.error(`SQLITE is not supported anymore`);
        }
        close(db);
    });
}