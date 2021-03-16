export const devconfig: Environment = {
    //  Login token for Mailman bot
    appToken: "ODA2MzI5OTIwMDY5MzA0MzYx.YBn3QQ.OrXfdLHFF4DYeQIPx6BhS6zAoNg",

    minimumConfessionLength: 10,

    MySQL: {
        "ip":"localhost",
        "port":"3306",
        "database_name":"mailman",
        "username":"root",
        "password":""
    },

    botName: "Mailman",
    botDeveloperName: "Long",
    botDeveloperContact: "<TBA>",    

    dedicatedServerName: "Dinopolis",
    dedicatedServerID: "798526353908432916",

    prefix: "#"    
};


// enum DatabaseList {
//     SQLite,
//     MySQL
// }

// enum DiscordJSVersion {
//     v12,
//     v13
// }

// const prefix = "#";
// const sqliteFileName = "data.sqlite";
// const appDataPath = "./app/data/";

//  export const  Database = DatabaseList.SQLite;
//  export const  Database = DatabaseList.MySQL;


// const PREFIX_LENGTH = 3;
// const PREFIX_CHARSET_ALP = 'abcdefghijklmnopqrstuvwxyz';
// const PREFIX_CHARSET_TOK = '!@#$%^&*-_+<>?:"~';
//  export const  discordJSVersion = DiscordJSVersion.v12;
//  export const  discordJSVersion = DiscordJSVersion.v13;