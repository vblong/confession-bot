export enum DatabaseList {
    SQLite,
    MySQL
}

export enum DiscordJSVersion {
    v12,
    v13
}

export const botName = "<YOUR_BOT_NAME>";
export const botDeveloperName = "<YOUR_DEVELOPER_NAME_OR_TEAM_NAME>";
export const botDeveloperContact = "<CONTACT_INFO>";
export const dedicatedServerName = "<DEDICATED_SERVER_NAME>";
export const appToken = "<YOUR_DISCORD_APP_TOKEN";
export const prefix = "<YOUR_BOT_TOKEN>";
export const sqliteFileName = "data.sqlite";
export const appDataPath = "./app/data/";
// export const Database = DatabaseList.SQLite;
export const Database = DatabaseList.MySQL;

export const MySQLConfig = {
    "ip":"localhost",
    "port":"3306",
    "database_name":"<YOUR_DB_NAME>",
    "username":"<YOUR_DB_USERNAME>",
    "password":"<YOUR_DB_PASSWORD"
};

// export const discordJSVersion = DiscordJSVersion.v12;
export const discordJSVersion = DiscordJSVersion.v13;