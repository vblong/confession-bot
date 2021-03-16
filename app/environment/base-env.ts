interface MySQLConfig {
    ip: string,
    port: string,
    database_name: string,
    username: string,
    password: string
};

interface Environment {
    /** Bot login token */
    appToken: string,    
    
    /** MySQL Settings */
    MySQL: MySQLConfig,

    /** BOT INFO */
    botName: string,
    botDeveloperName: string,
    botDeveloperContact: string,

    /**  CONFESSION SETTINGS */
    minimumConfessionLength: number,

    /** Server used for testing */
    dedicatedServerID: string,
    dedicatedServerName: string,

    /** SERVER SETTING */
    prefix: string,
    
};