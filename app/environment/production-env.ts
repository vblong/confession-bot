export const prodconfig: Environment = {
    //  Login token for Mailman bot
    appToken: "ODE2NDc4NjE2OTA0MDA3NzMw.YD7i9w.RauOWmqGXGXUQIRANqHIFZOWXlI",  

    // Confession must be at least 10 characters long
    minimumConfessionLength: 10,

    // MySQL config;
    MySQL: {
        "ip":"localhost",
        "port":"3306",
        "database_name":"confession-bot",
        "username":"confession-bot",
        "password":"@@Bp1yr7h228j"
    },

    botName: "Confession Bot",
    botDeveloperName: "Dating Confession Germany",
    botDeveloperContact: "<TBA>",
    
    dedicatedServerName: "Dating Confession Germany",
    dedicatedServerID: "740957889929281598",

    prefix: "#"
};

export enum DatabaseList {
    SQLite,
    MySQL
}

export enum DiscordJSVersion {
    v12,
    v13
}

// Login token for `Confession Bot`

export const prefix = "#";
export const sqliteFileName = "data.sqlite";
export const appDataPath = "./app/data/";

// export const Database = DatabaseList.SQLite;
export const Database = DatabaseList.MySQL;
export const minimumConfessionLength = 10; // 10 characters

export const PREFIX_LENGTH = 3;
export const PREFIX_CHARSET_ALP = 'abcdefghijklmnopqrstuvwxyz';
export const PREFIX_CHARSET_TOK = '!@#$%^&*-_+<>?:"~';
// export const discordJSVersion = DiscordJSVersion.v12;
export const discordJSVersion = DiscordJSVersion.v13;