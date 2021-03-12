const {Discord, Intents, Client} = require("discord.js");
const f = require('./functions.js');
const Servers = require('./server');
const config = require('./config');
const exec = require('./cmd-exec');
import { Commander } from './cmd-exec';
import { appToken } from './environment/environment';
import { ConfessionManager } from './modules/confessions/confession-mng';
import { DMModule } from './modules/message-processor/dm-module';

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
export let confessionChannelID: any = null;
export let pendingChannelID: any = null;

bot.on('ready', async () => {
    f.setUp();

    console.log('Bot is ready. Retrieving server list...');

    f.displayAllServers();

    f.synchingDatabase();

    f.setupPresence(bot);
    
    s = await dm.getServers();

    confessionChannelID = await dm.getConfessionChannelID();
    pendingChannelID = await dm.getConfessionPendingID();
    console.log(`CFS ChannelID: ${confessionChannelID.ID}`);
    console.log(`CFS PendingID: ${pendingChannelID.ID}`);
});

bot.login(config.appToken);

bot.on('message', async (msg: any) => {
  
  /**
   * Save messages from users to DB
   */
  if(msg.author.bot === false) {
    let now: Date = new Date();
    let nowStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    dm.saveMsgData(
      msg.content,
      msg.author.username,
      msg.author.id,
      (msg.channel.type === 'dm' ? "Private Message" : msg.channel.guild.name),
      (msg.channel.type === 'dm' ? "Private Message" : msg.channel.guild.id),
      (msg.channel.type === 'dm' ? "Private Message" : msg.channel.id),
      (msg.channel.type === 'dm' ? "Private Message" : msg.channel.name),
      msg.id,
      nowStr
    );
  }

  if(msg.channel.type === 'dm') { 
    //  TODO: reorganize code
    // let dmProcessor = new DMModule();
    // dmProcessor.process(msg);  
    // return; 
    /**
     * Do not process the message sent from the bot
     */
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
      
      /**
       *  If server has set up a pending channel then post there
       */
      pendingChannelID = await dm.getConfessionPendingID();
      if(pendingChannelID.ID !== null) {
        await f.postPendingConfession(bot, await f.buildPendingConfessionMsg(msg, msg.content))
        .then((result: any) => {
          msg.channel.send("Cám ơn bạn đã gửi confession. Confession của bạn sẽ được đăng sau khi được duyệt.");
          let obj: any = {
            author: {
              username: msg.author.username,
              id: msg.author.id
            },
            content: msg.content,
            id: result.id            
          };
          f.saveConfession(bot, obj, s[0].serverID, false);    
        }).catch((err: any) => {
          msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
          msg.channel.send("Chi tiết lỗi: `" + err + "`");
        });      
        return;
      } 
      /**
       * Otherwise post to the confession channel
       */
      confessionChannelID = await dm.getConfessionChannelID();
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

bot.on("messageReactionAdd", async function(reaction: any, author: any) {
  if(author.bot === true) return;
  let cfsObj: any = {
    serverID: reaction.message.channel.guild.id,
    channelID: reaction.message.channel.id,
    messageID: reaction.message.id,
    msg: reaction.message
  };

  if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();  
      /** Process the reactions on pending confession channel */
      if(reaction.message.channel.id === pendingChannelID.ID) {
        console.log("====", author.username, "reacts", reaction._emoji.name, "on message", reaction.message.id);
        let mng: ConfessionManager = new ConfessionManager();
        if(reaction._emoji.name === '✅')  {
          mng.approveCFS(cfsObj);
        } else if(reaction._emoji.name === '❌') {
          mng.denyCFS(cfsObj);
        }
      } else {
        console.log("Someone reacts something...");
      }    
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	} else {
    /** Process the reactions on pending confession channel */
    if(reaction.message.channel.id === pendingChannelID.ID) {
      console.log("====", author.username, "reacts", reaction._emoji.name, "on message", reaction.message.id);
      let mng: ConfessionManager = new ConfessionManager();
      if(reaction._emoji.name === '✅')  {
        mng.approveCFS(cfsObj);
      } else if(reaction._emoji.name === '❌') {
        mng.denyCFS(cfsObj);
      }
    } else {
      console.log("Someone reacts something...");
    }
  }
});