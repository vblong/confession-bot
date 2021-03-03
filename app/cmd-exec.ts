const config = require('./config');
const dm = require('./data/data_manager');
const Discord = require("discord.js");
const main = require('./main');
const f = require("./functions");

export function exec(bot: any, msg: any) {
    if(!msg.content.startsWith(config.prefix)) {
        console.log("Wrong prefix");
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
            replyAConfession(cfsNr, msg, args);
            break;
        case "setchannelid":
            if(msg.channel.type !== 'dm') break;
            let channelID = args[0];
            updateServerCFSID(channelID, msg, args);
            break;
        case "help":
            if(msg.channel.type !== 'dm') break;
            sendHelpGuide(msg);
            break;
        default:
            msg.reply(`Lệnh \`${cmd}\` không tồn tại. Gửi \`#help\` để xem hướng dẫn.`)
            break;
    }
}

export function clearMsg(num: number, msg: any) {
    msg.channel.bulkDelete(num).then(console.log).catch(console.log);
    console.log("Delete", num, "messages in channel '", msg.channel.name, "'");
}

export async function replyAConfession(cfsNr: number, msg: any, args: any) {

    if(args.length === 0) {
        msg.channel.send("Vui lòng không gửi confession trống.");
        return;
    }

    let contentStr = "";
    for(let i = 1 ; i < args.length ; i++) {
        contentStr += args[i] + " ";
    }

    if(contentStr.length < 10) {
        msg.channel.send("Vui lòng không gửi confession quá ngắn.");
        return;
    }

    let cfs = await dm.getConfessionId(cfsNr);
    if(cfs === undefined) {
        msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `không tìm thấy Confession số " + cfsNr + "`");
        return;
    }
    console.log("Found confession #" + cfsNr);
    console.log(cfs);
    let dino: any = main.bot.guilds.cache.find((g: any) => g.id === cfs.serverID);
    let chan: any = dino.channels.cache.find((c: any) => c.id === main.confessionChannelID.ID);
    if(chan === undefined) {
        msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `Không tìm thấy confession channel`");
    }
    chan.messages.fetch(cfs.discordMsgID).then(async (foundMessage: any) => { 
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
                id: result.id
            };
            f.saveConfession(main.bot, obj, main.s[0].serverID); 
        })
        .catch((err: any) => {
            msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `" + err + "`");
        });
    }
    })
    .catch((err: any) => {
        msg.channel.send("Lỗi: không tìm thấy confession #" + cfsNr);
    });
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

export function sendHelpGuide(msg: any) {
    let helpGuide = `Chào bạn, cám ơn bạn đã sử dụng bot **${config.botName}** :3
        \n**${config.botName}** là bot gửi confession được phát triển dành riêng cho server **${config.dedicatedServerName}**.
        \nĐể gửi confession thì bạn chỉ cần nhắn tin trực tiếp cho bot với nội dung confession là được, bạn cũng có thể gửi kèm ảnh.         
        \nĐể gửi confession trả lời 1 confession khác thì bạn nhắn cho bot với cú pháp \`#rep <id> <nội dung>\` (không bao gồm 2 dấu <>).        
        \nVí dụ, để rep confession số 1 thì bạn nhắn \`#rep 1 chào bạn\`.
        \nTrong quá trình sử dụng, nếu có bất kì trục trặc, thắc mắc hay góp ý vui lòng liên hệ admin :3
        \nChỉ thế thôi, chúc bạn chơi vui :3
    `;
    const embed = new Discord.MessageEmbed().setDescription(helpGuide);
    embed.setColor("#A62019");
    msg.channel.send(embed);
}