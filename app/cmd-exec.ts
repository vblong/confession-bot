const config = require('./config');
const dm = require('./data/data_manager');
const Discord = require("discord.js");
const main = require('./main');
const f = require("./functions");
import { BaseModule } from './modules/BaseModule';
import { DocsModule } from './modules/docs/docs-module';
import { Moderator } from './modules/moderation/moderator-module';
import { TTSpeaker } from './modules/tts/ttspeaker-module';

export class Commander {
    modules: Map<string, BaseModule> = new Map();

    constructor() {
        this.registerModules();
    }

    /** 
     *  Whenever you define more class. Register them here
     */
    registerModules() {
        this.modules.set("moderator", new Moderator());
        this.modules.set("ttspeaker", new TTSpeaker());
        this.modules.set("docsmodule", new DocsModule());
    }

    process(cmd: string, args: any, msg: any) {
        let foundCommand: boolean = false;
        this.modules.forEach((module: BaseModule, moduleName: string) => {
            if(module.getCommands().has(cmd)) {
                console.log(`---Found command ${cmd}`);
                module.exec(cmd, args, msg);
                foundCommand = true;
                return;
            }
        });

        if(foundCommand === false) {
            msg.channel.send(`Lệnh \`${cmd}\` không tồn tại. Gửi \`#help\` để xem hướng dẫn.`)
        }
    }
}

export function exec(bot: any, msg: any) {
    if(!msg.content.startsWith(config.prefix)) {
        console.info(`---INFO ${msg.author.username} sends: ${msg.content}`);
        return; 
    }

    const args = msg.content.slice(config.prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    cmdReplier(command, args, msg);
}

export function cmdReplier(cmd: string, args: any, msg: any) {
    switch(cmd) {
        case "clear":
            let num = 2;
            if(args[0]) {
                num = parseInt(args[0]) + 1;
            }
            clearMsg(num, msg);
            break;
        case "rep":
            if(msg.channel.type !== 'dm') break;
            let cfsNr = parseInt(args[0]);
            if(isNaN(cfsNr)) {
                msg.channel.send("ID confession không hợp lệ")
                break;
            }
            replyAConfession(cfsNr, msg, args);
            break;
        case "setchannelid":
            if(msg.channel.type !== 'dm') break;
            let channelID = args[0];
            updateServerCFSID(channelID, msg, args);
            break;
        case "setpendingid":
            if(msg.channel.type !== 'dm') break;
            let pendingChannelID = args[0];
            updateServerCFSPendingID(pendingChannelID, msg, args);
            break;
        default:
            let commando: Commander = new Commander();
            commando.process(cmd, args, msg);
            break;
    }
}

export function clearMsg(num: number, msg: any) {
    if(msg.channel.type === 'dm') {
        msg.channel.send("Không thể xóa tin nhắn trong kênh DM");
        return;
    }
    msg.channel.bulkDelete(num)
    .then((res: any) => {
        console.log(`Delete **${num}** messages in channel **${msg.channel.name}**`);
    }).catch((err: any) => {
        console.log(`Error while deleting messages: ${err}`);
    });
}

export async function replyAConfession(cfsNr: number, msg: any, args: any) {
    if(args.length === 0) {
        msg.channel.send("Vui lòng không gửi confession trống.");
        return;
    }

    let contentStr = "";
    for(let i = 1 ; i < args.length ; i++) contentStr += args[i] + " ";

    if(msg.attachments.size === 0 && contentStr.length < 10) {
        msg.channel.send("Vui lòng không gửi confession quá ngắn.");
        return;
    }

    let cfs = await dm.getConfessionId(cfsNr);
    if(cfs === undefined) {
        msg.channel.send("Đã xảy ra lỗi, vui lòng liên hệ developer.\nLỗi: `không tìm thấy Confession số " + cfsNr + "`");
        return;
    }

    let dino: any = main.bot.guilds.cache.find((g: any) => g.id === cfs.serverID);
    let pendingChannelID = await dm.getConfessionPendingID();
    /**
     * NO - PENDING
     * Server has not specified any pending channel for confession
     * So we gonna post the confession directly to the confession channel
     */
    if(pendingChannelID.ID === null) {
        let confessionChannelID = await dm.getConfessionChannelID();
        let chan: any = dino.channels.cache.find((c: any) => c.id === confessionChannelID.ID);
        if(chan === undefined) {
            msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `Không tìm thấy confession channel`");
        }
        chan.messages.fetch(cfs.discordMsgID)
        .then(async (foundMessage: any) => { 
            if(foundMessage) {
                f.postConfession(main.bot, await f.buildConfessionMsg(msg, contentStr, cfsNr), foundMessage)
                .then((result: any) => {
                    msg.channel.send("Đã đăng confession thành công");
                    let obj: any = {
                        author: {
                            username: msg.author.username,
                            id: msg.author.id
                        },
                        content: msg.content,
                        id: result.id,
                        confessionRepID: cfsNr
                    };
                    f.saveConfession(main.bot, obj, main.s[0].serverID); 
                })
                .catch((err: any) => {
                    msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `" + err + "`");
                });
            }
        })
        .catch((err: any) => {
            msg.channel.send(`Đã xảy ra lỗi. Vui lòng liên hệ developer.\nChi tiết lỗi: \`${err}\``);
        });
    } else {
        /**
         * YES - PENDING
         * Server has a channel for pending approval confession
         */
        let confessionChannelID = await dm.getConfessionChannelID();
        let chan: any = dino.channels.cache.find((c: any) => c.id === confessionChannelID.ID);
        if(chan === undefined) {
            msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `Không tìm thấy pending channel`");
        }
        await f.postPendingConfession(main.bot, await f.buildPendingConfessionMsg(msg, contentStr, cfsNr))
        .then((result: any) => {
            msg.channel.send("Cám ơn bạn đã gửi confession. Confession của bạn sẽ được đăng sau khi được duyệt.");
            let obj: any = {
                author: {
                username: msg.author.username,
                id: msg.author.id
                },
                content: msg.content,
                id: result.id,
                confessionRepID: cfsNr 
            };
            f.saveConfession(main.bot, obj, main.s[0].serverID, false);    
        })
        .catch((err: any) => {
            msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
            msg.channel.send("Chi tiết lỗi: `" + err + "`");
        });      
        return;
    }
}

export async function updateServerCFSID(cfsID: any, msg: any, args: any) {
    let ownedServers = f.getServerOwnerShip(msg.channel.recipient.id);
    let found: boolean = false;
    if(ownedServers.length === 0) {
        msg.reply("You must be a server's owner to do this command");
        return;
    }

    /** Find channel by channel's id */
    let server: any;
    ownedServers.forEach((g: any) => {
        // console.log(g.name, "'s channels");
        g.channels.cache.forEach((v: any, k: any) => {
            // console.log(v.id, " ", v.name);
            if(v.id === cfsID) {
                found = true;
                server = {
                    serverID: g.id,
                    confessionChannelID: cfsID,
                };
            }
        });
    });

    /** If not found then find channel by channel's name */
    if(!found) {
        let channel: any = ownedServers[0].channels.cache.find((chan: any) => chan.name === cfsID );
        if(channel !== undefined) {
            found = true;
            server = {
                serverID: channel.guild.id,
                confessionChannelID: channel.id
            }
            cfsID = channel.id;
        }
    }

    if(!found) {
        msg.channel.send(`I could not find the channel with the provided name/id *${cfsID}*, please check again`);
    } else {        
        let result = dm.updateServerCFSIDOnDB(server);
        if(result) {
            msg.channel.send("Broadcast channel has been set up successfully");
            main.confessionChannelID = { ID: cfsID };
            main.s = await dm.getServers();

        } else {
            msg.channel.send("Broadcast channel update failed. Please contact developer");
        }
    }
    
}

export async function updateServerCFSPendingID(pendingChannelID: any, msg: any, args: any) {
    let ownedServers = f.getServerOwnerShip(msg.channel.recipient.id);
    let found: boolean = false;
    if(ownedServers.length === 0) {
        msg.reply("You must be a server's owner to do this command");
        return;
    }

    /** Find channel by channel's id */
    let server: any;
    ownedServers.forEach((g: any) => {
        // console.log(g.name, "'s channels");
        g.channels.cache.forEach((v: any, k: any) => {
            // console.log(v.id, " ", v.name);
            if(v.id === pendingChannelID) {
                found = true;
                server = {
                    serverID: g.id,
                    confessionChannelID: pendingChannelID,
                };
            }
        });
    });

    /** If not found then find channel by channel's name */
    if(!found) {
        let channel: any = ownedServers[0].channels.cache.find((chan: any) => chan.name === pendingChannelID );
        if(channel !== undefined) {
            found = true;
            server = {
                serverID: channel.guild.id,
                confessionPendingID: channel.id
            }
            pendingChannelID = channel.id;
        }
    }

    if(!found) {
        msg.channel.send(`I could not find the channel with the provided name/id *${pendingChannelID}*, please check again`);
    } else {        
        let result = dm.updateServerPendingCFSIDOnDB(server);
        if(result) {
            msg.channel.send("Pending confession channel has been set up successfully");
            main.pendingChannelID = { ID: pendingChannelID };
            main.s = await dm.getServers();

        } else {
            msg.channel.send("Pending confession channel update failed. Please contact developer");
        }
    }
    
}

