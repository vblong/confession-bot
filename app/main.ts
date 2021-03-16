// const {Discord, Intents, Client} = require("discord.js");
// const f = require('./functions.js');
// const Servers = require('./server');
import { MainModule } from './main-module';
import { devconfig } from './environment/development-env';
import { prodconfig } from './environment/production-env';
import { DBControl } from './data/dbcontrol';

/** v12 */
// export const bot = new Discord.Client();
/** v13 */
// const dm = require('./data/dbcontrol');
// const server = new Servers.Server();
// export let s: any;
// export let confessionChannelID: any = null;
// export let pendingChannelID: any = null;

export let config: Environment;
export let db: DBControl = new DBControl();
export let bot: any

let envStr: any = process.argv[2] || 'development';
if(envStr === 'development') 
  config = devconfig;
else 
  config = prodconfig;

let mainModule: MainModule = new MainModule();
mainModule.boot();
bot = mainModule.getClient();