const {Discord, Intents, Client} = require("discord.js");
const f = require('./functions.js');
const Servers = require('./server');
const config = require('./config');
const exec = require('./cmd-exec');
/** v12 */
// export const bot = new Discord.Client();
/** v13 */
export const bot = new Client({ 
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
  intents: Intents.ALL | Intents.PRIVILEGED
});
const dm = require('./data/data_manager');
const server = new Servers.Server();
export let s: any;
export let confessionChannelID: any;

bot.on('ready', async () => {
    f.setUp();

    console.log('Bot is ready. Retrieving server list...');

    f.displayAllServers();

    f.synchingDatabase();

    f.setupPresence(bot);
    
    s = await dm.getServers();

    confessionChannelID = await dm.getConfessionChannelID();
});

bot.login(config.appToken);

bot.on('message', async (msg: any) => {
  
  if(msg.author.bot === false) {
    let now: Date = new Date();
    let nowStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    dm.saveMsgData(
      msg.content,
      msg.author.username,
      msg.author.id,
      (msg.channel.type === 'dm' ? "Private Message" : msg.channel.guild.name),
      (msg.channel.type === 'dm' ? "Private Message" : msg.channel.guild.id),
      msg.id,
      nowStr
    );
  }

  if(msg.channel.type === 'dm') {
    if(msg.author.id != bot.user.id) {
      console.log(`------${msg.author.username} sends: ${msg.content}`);
      /**
       * If the message is from the bot then move to command section
       */
      if(msg.content.startsWith(config.prefix)) {
        exec.exec(bot, msg);
        return;
      }

      /**
       * Prevent too short messages
       */
      if(msg.content.length < config.minimumConfessionLength) {
        msg.channel.send("Vui lòng không gửi confession quá ngắn");
        return;
      }
      
      await f.postConfession(bot, await f.buildConfessionMsg(msg, msg.content))
      .then((result: any) => {
        msg.channel.send("Đã đăng confession thành công.");
        let obj: any = {
          author: {
            username: msg.author.username,
            id: msg.author.id
          },
          content: msg.content,
          id: result.id
        };
        f.saveConfession(bot, obj, s[0].serverID);    
      }).catch((err: any) => {
        msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
        msg.channel.send("Chi tiết lỗi: `" + err + "`");
      });      
      return;
    }
    return;
  } 

  //  Otherwise, execute the command
  exec.exec(bot, msg);
});

bot.on("guildCreate", function(guild: any){
  console.log(`Joined guild:`);
  console.log("Server name: " + guild.name);
  console.log("Server ID: " + guild.id);
  console.log("Server region: " + guild.region);
  console.log("Server owner ID: " + guild.ownerID);
  f.synchingDatabase();
  f.displayAllServers();
  f.greetOwner(guild.ownerID);
});