import { Client, Intents } from "discord.js";
import { Shell } from "./shell";
import { Utils } from "./utils";
import { config, db } from './main';
import { ConfessionManager } from "./modules/confessions/confession-mng";
export class MainModule {

    private bot: Client = new Client({ intents: Intents.ALL });
    private ut: Utils = new Utils();
    private cmd: Shell = new Shell();

    constructor() {}

    boot() {
        db.createDBTables();
        this.startBot();
        this.setUpListeners();
    }

    getClient() { return this.bot; }

    startBot() {
        console.log("Creating bot instance...");
        this.bot = new Client({ 
            partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
            intents: Intents.ALL | Intents.PRIVILEGED
        });

        console.log("Login bot...");
        this.bot.login(config.appToken);   
    }

    setUpListeners() {
        this.onReady();
        this.onMessage();
        this.onGuildCreate();
        this.onMessageReactionAdd();
    }

    setupPresence(client: any) {
        client.user.setPresence({ 
            activities: [ 
                { 
                    // type: 'WATCHING',
                    name: 'Nhắn tin trực tiếp cho mình để gửi confession, hoặc nhắn #help cho mình để xem hướng dẫn sử dụng.' 
                }
            ], 
            status: 'online' 
        });
    }

    onReady() {
        this.bot.on('ready', async () => {
            console.log('Bot is ready. Retrieving server list...');
        
            this.ut.displayAllServers();
        
            this.ut.synchingDatabase();
        
            this.setupPresence(this.bot);
        });
    }

    onMessage() {
        this.bot.on('message', async (msg: any) => {
  
            /**
             * Save messages from users to DB
             */
            if(msg.author.bot === false) {
                let now: Date = new Date();
                let nowStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                db.saveMsgData({
                    'content': msg.content,
                    'authorName': msg.author.username,
                    'authorID': msg.author.id,
                    'serverName': (msg.channel.type === 'dm' ? "Private Message" : msg.channel.guild.name),
                    'serverID': (msg.channel.type === 'dm' ? "Private Message" : msg.channel.guild.id),
                    'channelID': (msg.channel.type === 'dm' ? "Private Message" : msg.channel.id),
                    'channelName': (msg.channel.type === 'dm' ? "Private Message" : msg.channel.name),
                    'discordMsgID': msg.id,
                    'createdTime': nowStr
                });
            }

            if(msg.channel.type === 'dm') { 
                //  TODO: reorganize code
                // let dmProcessor = new DMModule();
                // dmProcessor.process(msg);  
                // return; 

                /**
                 * Do not process the message sent from the bot
                 */
                if(msg.author.bot === true) return;

                console.log(`------${msg.author.username} sends: ${msg.content}`);
                /**
                 * Process private command
                 */
                if(msg.content.startsWith(config.prefix)) {
                    this.cmd.exec(msg);
                    return;
                }

                /**
                 * Prevent too short messages
                 */
                if(msg.attachments.size === 0 && msg.content.length < config.minimumConfessionLength) {
                    msg.channel.send("Vui lòng không gửi confession quá ngắn");
                    return;
                }  
      
                /**
                 *  Post PENDING confession if possible
                 *  Return data example: 
                 *      [ RowDataPacket { ID: 123456789 } ]
                 *      [ RowDataPacket { ID: null } ]
                 */
                let pendingChannelID: any = await db.getConfessionPendingID(config.dedicatedServerID);                
                if(pendingChannelID[0].ID !== null) {
                    await this.ut.postPendingConfession(await this.ut.buildPendingConfessionMsg(msg, msg.content))
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

                        
                        this.ut.saveConfession(obj, config.dedicatedServerID, false);    
                    }).catch((err: any) => {
                        msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
                        msg.channel.send("Chi tiết lỗi: `" + err + "`");
                    });      
                    return;
                } 
                /**
                 * Otherwise post to the confession channel
                 */
                await this.ut.postConfession(await this.ut.buildConfessionMsg(msg, msg.content))
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
                    this.ut.saveConfession(obj, config.dedicatedServerID);    
                }).catch((err: any) => {
                    msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
                    msg.channel.send("Chi tiết lỗi: `" + err + "`");
                });      
                return;
            } 

            //  Otherwise, execute the command
            this.cmd.exec(msg);
        });
    }

    onGuildCreate() {
        this.bot.on("guildCreate", (guild: any) => {
            console.log(`Joined guild:`);
            console.log("Server name: " + guild.name);
            console.log("Server ID: " + guild.id);
            console.log("Server region: " + guild.region);
            console.log("Server owner ID: " + guild.ownerID);
            this.ut.synchingDatabase();
            this.ut.displayAllServers();
            this.ut.greetOwner(guild.ownerID);
        });
    }

    onMessageReactionAdd() {
        this.bot.on("messageReactionAdd", async function(reaction: any, author: any) {
            if(author.bot === true) return;
            let cfsObj: any = {
                serverID: reaction.message.channel.guild.id,
                channelID: reaction.message.channel.id,
                messageID: reaction.message.id,
                msg: reaction.message
            };
            let pendingChannelID: any = await db.getConfessionPendingID(config.dedicatedServerID);
            
            if (reaction.partial) {
                // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
                try {
                    await reaction.fetch();  
                    /** Process the reactions on pending confession channel */
                    if(reaction.message.channel.id === pendingChannelID[0].ID) {
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
                if(reaction.message.channel.id === pendingChannelID[0].ID) {
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
    }
}