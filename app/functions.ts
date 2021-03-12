const fs = require('fs');
const Discord = require("discord.js");
const dm = require('./data/data_manager');
const cf = require('./config');

import { Server } from './server';
import { bot } from './main';
import { PREFIX_CHARSET_ALP, PREFIX_CHARSET_TOK, PREFIX_LENGTH } from './config';

const main = require("./main");

export function setUp() {
    console.log("Initiating...");
    if(cf.Database === cf.DatabaseList.MySQL) dm.createMySQLTbls();
}

export async function synchingDatabase() {
    console.log("Synching server cache with database...");
    let servers: any = await dm.getServers();
    let prefixes: any = await dm.getUsedPrefixes();
    // for(let i in prefixes) {
    //     console.log(prefixes[i].prefix);
    // }
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
                console.log(`New prefix created: ${prefix}`);
                for(let i in prefixes) {
                    if(prefixes[i].prefix === prefix) {
                        existed = true;
                    }
                }
            }
            console.log(`New prefix for server ${v.name}: ${prefix}`);
            saveServer({
                serverID: v.id,
                ownerID: v.ownerID,
                serverName: v.name,
                prefix: prefix
            });
        }
    });    
}

export function findServerIDByName(bot: any, term: any) {
    for (const [key, value] of bot.guilds.cache.entries()) {
        if(value.name === term)
            return value.id;
    }
    return -1;
}

export function findServerOwnerIDByName(bot: any, term: any) {
    for (const [key, value] of bot.guilds.cache.entries()) {
        if(value.name === term)
            return value.ownerID;
    }
    return -1;
}

export function displayAllServers() {
    console.log("Watching", bot.guilds.cache.size, "guild(s)");
    bot.guilds.cache.forEach((v: any, k: any) => {
        console.log("---------------------------------------------------------");
        console.log("Server name:", v.name);
        console.log("Server id:", k);
        console.log("Server owner id:", v.ownerID);
        console.log();
    });
}

export function displayAllChannelsOfAServer(bot: any, serverID: string) {
    var cnt = 0;
    for (const [key, value] of bot.guilds.cache.entries()) {
        if(key === serverID) {
            // console.log(value);
            for(const [key1, value1] of value.channels.cache.entries()) {
                console.log("---------------------------------------------------------");
                console.log(value1.name);
                console.log();
            }
        }
    }
}

export function isFileExisted(filePath: any) {
    try {
        if(fs.existsSync(filePath)) {
            return true;
        }
    } catch(err) {
        console.log("File", filePath, "does not exist");
        return false;
    }
}

export function loadServers() {
    let serverFilePath = './app/data/data_server.json';
    //  File not existed, create one
    if(isFileExisted(serverFilePath) === false) {
        let s = new Server();
        fs.writeFile(serverFilePath, JSON.stringify(s), (err: any) => {
            console.log(serverFilePath, "does not exist, creating one...");
        });            
    } else {
    //  File existed, read all of them
        fs.readFile(serverFilePath, 'utf-8', (err: any, data: any) => {
            //  Double check for file existence
            if(err) {
                console.log("An error occured:", err);                    
                let s = new Server();
                console.log("new server to save:", JSON.stringify(s));
                fs.writeFile(serverFilePath, JSON.stringify(s), (err: any) => {
                    console.log(serverFilePath, "does not exist, creating one...");
                });   
                return;
            } else {
                const s = JSON.parse(data.toString());
                console.log(s);     
            }
        });
    }
}

export function getServerOwnerShip(ownerID: string) {
    let ownedServers: any = [];
    bot.guilds.cache.forEach((v: any, k: any) => {
        if(v.ownerID === ownerID)
            ownedServers.push(v);
    });
    return ownedServers;
}

export function updateServerConfessionChannelID(server: any) {
    dm.updateServer(server);
}
export function saveServer(server: any) {
    dm.saveServerOnDB(server);
}

export async function postConfession(bot: any, content: any, repMsg: any = undefined) {
    let channel: any = bot.channels.cache.get(main.confessionChannelID.ID);
    let success: any = undefined;
    let error: any = undefined;

    if(main.confessionChannelID.ID === '0' || channel === undefined) {
        error = "Server chưa thiết lập kênh confession. Dùng lệnh `#setchannelid` để cài đặt. Lưu ý bot phải có quyền gửi tin nhắn vào channel đó."
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

export async function postPendingConfession(bot: any, content: any) {
    let channel: any = bot.channels.cache.get(main.pendingChannelID.ID);
    let success: any = undefined;
    let error: any = undefined;

    if(main.pendingChannelID.ID === '0' || channel === undefined) {
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

export async function buildConfessionMsg(msg: any, content: any, refNr: any = undefined) {
    const logo = "https://cdn.discordapp.com/icons/740957889929281598/308967560c5fc809723b2ee4a1547af8.webp";    
    let id = await dm.getHighestConfessionId();
    let startingConfessionId = id.ID + 1;
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

export async function buildPendingConfessionMsg(msg: any, content: any, refNr: any = undefined) {
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

export async function saveConfession(bot: any, msg: any, serverID: any, approved: boolean = true) {
    let id: any = { ID: -1 };
    if(approved) id = await dm.getHighestConfessionId();    
    let confessionID = id.ID + 1;
    let confessionRepID = -1;
    if(msg.hasOwnProperty("confessionRepID")) confessionRepID = msg.confessionRepID;
    dm.saveConfession(
        msg.author.username,
        msg.author.id,
        msg.id,
        serverID,
        msg.content,
        confessionID,
        approved,
        confessionRepID
    );
}

export function setupPresence(client: any) {
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


export function greetOwner(ownerID: string) {
    let greet = `Xin chào, cám ơn bạn đã sử dụng bot \`${cf.botName}\`.
    \nBạn vui lòng gửi tin nhắn \`#setchannelid <tên/id-channel>\` (không bao gồm 2 dấu <>) cho mình để mình biết nên gửi confession vào channel nào. Bạn nhớ lưu ý kiểm tra và cấp quyền gửi tin nhắn vào channel cho bot.
    \nNếu bạn chưa biết cách lấy id của channel thì hãy xem bài này:
    \nhttps://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-
    \nTrong quá trình sử dụng nếu có bất kì thắc mắc, phản hồi hay trục trặc nào vui lòng liên hệ \`<TODO>\``;

    main.bot.users.cache.get(ownerID).send(greet);
}