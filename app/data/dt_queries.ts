export const create_table_queries = [
    `CREATE TABLE IF NOT EXISTS servers ( 
        id INT PRIMARY KEY AUTO_INCREMENT,
        serverID TEXT NOT NULL,
        ownerID	TEXT NOT NULL,
        confessionChannelID	TEXT NOT NULL,
        serverName TEXT NOT NULL,
        logoLink TEXT,
        cfsTxt TEXT,
        footerText TEXT
    ) ENGINE=INNODB;`,

    `CREATE TABLE IF NOT EXISTS confessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content	TEXT NOT NULL,
        authorName TEXT,
        authorID TEXT NOT NULL,
        discordMsgID TEXT NOT NULL,
        serverID TEXT NOT NULL,
        confessionID INT NOT NULL
    ) ENGINE=INNODB;`,

    `CREATE TABLE IF NOT EXISTS msg_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content	TEXT NOT NULL,
        authorName TEXT,
        authorID TEXT NOT NULL,
        discordMsgID TEXT NOT NULL,
        serverName TEXT NOT NULL,
        serverID TEXT NOT NULL,
        confessionID INT NOT NULL,
        createdTime DATETIME NOT NULL
    ) ENGINE=INNODB;`
];
