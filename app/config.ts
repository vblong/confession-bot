export enum DatabaseList {
    SQLite,
    MySQL
}

export enum DiscordJSVersion {
    v12,
    v13
}

export const botName = "Confession Bot";
export const botDeveloperName = "Dating Confession Germany";
export const botDeveloperContact = "<TBA>";
export const dedicatedServerName = "Dating Confession Germany";
// export const appToken = "ODA2MzI5OTIwMDY5MzA0MzYx.YBn3QQ.OrXfdLHFF4DYeQIPx6BhS6zAoNg";   // Mailman bot
export const appToken = "ODE2NDc4NjE2OTA0MDA3NzMw.YD7i9w.RauOWmqGXGXUQIRANqHIFZOWXlI";      // Confession bot
export const prefix = "#";
export const sqliteFileName = "data.sqlite";
export const appDataPath = "./app/data/";
// export const Database = DatabaseList.SQLite;
export const Database = DatabaseList.MySQL;
export const minimumConfessionLength = 10; // 10 characters
/**
 * MySQL DB info on dev environment
 */
// export const MySQLConfig = {
//     "ip":"localhost",
//     "port":"3306",
//     "database_name":"mailman",
//     "username":"root",
//     "password":""
// };

/**
 * MySQL DB info on production environment
 */
export const MySQLConfig = {
    "ip":"localhost",
    "port":"3306",
    "database_name":"confession-bot",
    "username":"confession-bot",
    "password":"@@Bp1yr7h228j"
};

export const PREFIX_LENGTH = 3;
export const PREFIX_CHARSET_ALP = 'abcdefghijklmnopqrstuvwxyz';
export const PREFIX_CHARSET_TOK = '!@#$%^&*-_+<>?:"~';
// export const discordJSVersion = DiscordJSVersion.v12;
export const discordJSVersion = DiscordJSVersion.v13;