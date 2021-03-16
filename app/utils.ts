const fs = require('fs');
const Discord = require("discord.js");
const dm = require('./data/dbcontrol');
import { bot, db, config } from './main';
import { PREFIX_CHARSET_ALP, PREFIX_CHARSET_TOK, PREFIX_LENGTH } from './config';

export class Utils {
    constructor() {
    }

    displayAllServers() {
        console.log("Watching", bot.guilds.cache.size, "guild(s)");
        bot.guilds.cache.forEach((v: any, k: any) => {
            console.log("---------------------------------------------------------");
            console.log("Server name:", v.name);
            console.log("Server id:", k);
            console.log("Server owner id:", v.ownerID);
            console.log();
        });
    }

    async synchingDatabase() {
        console.log("Synching server cache with database...");
        let servers: any = await db.getServersFromDB();
        let prefixes: any = await db.getUsedPrefixes();

        bot.guilds.cache.forEach((v: any, k: any) => {
            let found: boolean = false;
            servers.forEach((s: any) => {
                if(s.serverID === k) found = true;
            });        
    
            //  If server found in cache but not in DB then save it in the DB
            if(!found) {
                /**
                 * Create a random prefix for the server
                 */
                let existed: boolean = true;
                let prefix = '';
                while(existed === true) {
                    prefix = '';
                    existed = false;
                    /** First letters are alphabetical characters */
                    while(prefix.length < PREFIX_LENGTH - 1) {
                        let r = Math.floor(Math.random() * (1 + PREFIX_CHARSET_ALP.length - 0)) + 0;
                        prefix += PREFIX_CHARSET_ALP[r];
                    }
                    /** Last letter is a token */
                    prefix += PREFIX_CHARSET_TOK[Math.floor(Math.random() * (1 + PREFIX_CHARSET_TOK.length - 0)) + 0]
                    for(let i in prefixes) {
                        if(prefixes[i].prefix === prefix) {
                            existed = true;
                        }
                    }
                }
                console.log(`Adding server ${v.name} to DB, prefix : ${prefix}`);
                db.saveServerOnDB({
                    serverID: v.id,
                    ownerID: v.ownerID,
                    serverName: v.name,
                    prefix: prefix
                });
            }
        });    
    }

    async postConfession(content: any, repMsg: any = undefined) {
        let confessionChannelID: any = await db.getConfessionChannelID(config.dedicatedServerID);
        let channel: any = bot.channels.cache.get(confessionChannelID[0].ID);
        let success: any = undefined;
        let error: any = undefined;
    
        if(confessionChannelID.ID === null || channel === undefined) {
            error = "Server chưa thiết lập kênh confession. Dùng lệnh `#cfsid` để cài đặt. Lưu ý bot phải có quyền gửi tin nhắn vào channel đó."
        }
        
        if(error === undefined) {
            if(repMsg === undefined) {
                await channel.send(content)
                .then((res: any) => {
                    success = res;
                })
                .catch((res: any) => {
                    error = res;
                });
            } else {
                await repMsg.reply(content)
                .then((res: any) => {
                    success = res;
                })
                .catch((res: any) => {
                    error = res;
                });
            }
        }
    
        return new Promise((resolve, reject) => {
            if(success !== undefined) {
                resolve(success);
            } else {
                reject(error);
            }
        });
    }

    async buildConfessionMsg(msg: any, content: any, refNr: any = undefined) {
        const logo = "https://cdn.discordapp.com/icons/740957889929281598/308967560c5fc809723b2ee4a1547af8.webp";    
        let id: any = await db.getHighestConfessionId(config.dedicatedServerID);
        if(id.length === 0) id = [{ ID: 0}];
        let startingConfessionId = (id[0].ID === null ? 0 : id[0].ID + 1);
        let authorStr: string = "Confession #" + startingConfessionId;
        if(refNr !== undefined && refNr > 0) {
            authorStr += " - Trả lời confession #" + refNr;
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')	    
            .setAuthor(authorStr, logo)
            .setDescription((content === null ? "" : content))
            .setThumbnail(logo)
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png')
            .setFooter("Dating Confession Germany Team");
            
        if(msg.attachments && msg.attachments.size > 0) {
            let attachs = msg.attachments;
            attachs.forEach((value: any, key: any) => {
                embed.setImage(value.attachment);
            });
        } else if(msg.embeds.length > 0 && msg.embeds[0].image !== null) {
            console.log(msg.embeds[0].image.url);
            embed.setImage(msg.embeds[0].image.url);
        }     
        return embed;
    }

    async postPendingConfession(content: any) {
        let pendingChannelID: any = await db.getConfessionPendingID(config.dedicatedServerID);                
        let channel: any = bot.channels.cache.get(pendingChannelID[0].ID);
        let success: any = undefined;
        let error: any = undefined;
    
        if(pendingChannelID.ID === '0' || channel === undefined) {
            error = "Kênh duyệt confession có lỗi. Vui lòng liên hệ admin hoặc developer.";
        }
        
        if(error === undefined) {        
            await channel.send(content)
            .then((res: any) => {
                success = res;
                success.react('✅')
                .then(() => { success.react('❌'); })
                .catch(() => console.error('One of the emojis failed to react.'));;
            })
            .catch((res: any) => {
                error = res;
            });
        }
    
        return new Promise((resolve, reject) => {
            if(success !== undefined) {
                resolve(success);
            } else {
                reject(error);
            }
        });
    }

    async buildPendingConfessionMsg(msg: any, content: any, refNr: any = undefined) {
        const logo = "https://cdn.discordapp.com/icons/740957889929281598/308967560c5fc809723b2ee4a1547af8.webp";    
        let authorStr: string = "Confession chờ duyệt";
        if(refNr !== undefined) {
            authorStr += " - Trả lời confession #" + refNr;
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')	    
            .setAuthor(authorStr, logo)
            .setDescription(content)
            .addFields(
                { name: 'Duyệt', value: ':white_check_mark:', inline: true },
                { name: 'Không duyệt', value: ':x:', inline: true },
            )
        
        if(msg.attachments !== undefined) {
            if(msg.attachments.size > 0) {
                let attachs = msg.attachments;
                attachs.forEach((value: any, key: any) => {
                    embed.setImage(value.attachment);
                });
            }        
        } 
        return embed;
    }

    async saveConfession(msg: any, serverID: any, approved: boolean = true) {
        let id: any = [{ ID: -1 }];
        if(approved) {
            id = await db.getHighestConfessionId(config.dedicatedServerID);  
            if(id.length === 0) 
                id = [{ ID: 0 }];
        }
        let confessionID = id[0].ID + 1;
        let confessionRepID = -1;
        if(msg.hasOwnProperty("confessionRepID")) confessionRepID = msg.confessionRepID;
        db.saveConfession({
            'authorName': msg.author.username,
            'authorID': msg.author.id,
            'discordMsgID': msg.id,
            'serverID': serverID,
            'content': msg.content,
            'confessionID': confessionID,
            'approved': approved,
            'confessionRepID': confessionRepID
        });
    }

    greetOwner(ownerID: string) {
        let greet = `Xin chào, cám ơn bạn đã sử dụng bot \`${config.botName}\`.
        \nBạn vui lòng gửi tin nhắn \`#setchannelid <tên/id-channel>\` (không bao gồm 2 dấu <>) cho mình để mình biết nên gửi confession vào channel nào. Bạn nhớ lưu ý kiểm tra và cấp quyền gửi tin nhắn vào channel cho bot.
        \nNếu bạn chưa biết cách lấy id của channel thì hãy xem bài này:
        \nhttps://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-
        \nTrong quá trình sử dụng nếu có bất kì thắc mắc, phản hồi hay trục trặc nào vui lòng liên hệ \`<TODO>\``;
    
        bot.users.cache.get(ownerID).send(greet);
    }

    getOwnServers(ownerID: string) {
        let ownedServers: any = [];
        bot.guilds.cache.forEach((v: any, k: any) => {
            if(v.ownerID === ownerID)
                ownedServers.push(v);
        });
        return ownedServers;
    }

    /**
     * @param filePath 
     * @returns 
     * Used in the very first versions. Now is useless
     */
    isFileExisted(filePath: any) {
        try {
            if(fs.existsSync(filePath)) {
                return true;
            }
        } catch(err) {
            console.log("File", filePath, "does not exist");
            return false;
        }
    }
}

// export function findServerIDByName(bot: any, term: any) {
//     for (const [key, value] of bot.guilds.cache.entries()) {
//         if(value.name === term)
//             return value.id;
//     }
//     return -1;
// }

// export function findServerOwnerIDByName(bot: any, term: any) {
//     for (const [key, value] of bot.guilds.cache.entries()) {
//         if(value.name === term)
//             return value.ownerID;
//     }
//     return -1;
// }

// export function displayAllChannelsOfAServer(bot: any, serverID: string) {
//     for (const [key, value] of bot.guilds.cache.entries()) {
//         if(key === serverID) {
//             for(const [key1, value1] of value.channels.cache.entries()) {
//                 console.log("---------------------------------------------------------");
//                 console.log(value1.name);
//                 console.log();
//             }
//         }
//     }
// }

// export function updateServerConfessionChannelID(server: any) {
//     dm.updateServer(server);
// }