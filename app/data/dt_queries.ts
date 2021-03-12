export const create_table_queries = [
    `CREATE TABLE IF NOT EXISTS servers ( 
        id INT PRIMARY KEY AUTO_INCREMENT,
        serverID TEXT NOT NULL,
        serverName TEXT NOT NULL,
        ownerID	TEXT NOT NULL,
        confessionChannelID	TEXT,
        confessionPendingID TEXT,
        prefix VARCHAR(4),
        logoLink TEXT,
        cfsTxt TEXT,
        footerText TEXT,
        isPremium BOOLEAN,
        premiumExpiredOn DATETIME
    ) ENGINE=INNODB;`,

    `CREATE TABLE IF NOT EXISTS confessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content	TEXT NOT NULL,
        authorName TEXT,
        authorID TEXT NOT NULL,
        discordMsgID TEXT NOT NULL,
        serverID TEXT NOT NULL,
        confessionID INT NOT NULL,
        confessionRepID INT,
        approved BOOLEAN
    ) ENGINE=INNODB;`,

    `CREATE TABLE IF NOT EXISTS msg_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content	TEXT NOT NULL,
        authorName TEXT,
        authorID TEXT NOT NULL,
        discordMsgID TEXT NOT NULL,
        serverID TEXT NOT NULL,
        serverName TEXT,
        channelID TEXT,
        channelName TEXT,        
        createdTime DATETIME NOT NULL
    ) ENGINE=INNODB;`
];
