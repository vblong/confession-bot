import { Utils } from "../../utils";
import { db, bot, config } from "../../main";
const main = require('../../main');
export class ConfessionManager {

    constructor() {}

    async approveCFS(confessionObj: any) {
        console.log(`After approve or deny: ${confessionObj.messageID}`);
        let confessionRepID: any = await db.getConfessionInfoByMsgID(confessionObj.messageID, "confessionRepID");
        let id: any = await db.getHighestConfessionId(config.dedicatedServerID);
        if(id[0].ID === -1) id[0].ID = 0;
        confessionObj.confessionID = id[0].ID + 1;
        let repMessage: any = undefined;

        if(confessionRepID[0].confessionRepID > 0) {
            let cfs: any = await db.getConfessionId(confessionRepID[0].confessionRepID);
            if(cfs.length > 0) {
                let dino: any = main.bot.guilds.cache.find((g: any) => g.id === cfs[0].serverID);
                let confessionChannelID: any = await db.getConfessionChannelID(config.dedicatedServerID);
                let chan: any = dino.channels.cache.find((c: any) => c.id === confessionChannelID[0].ID);
                await chan.messages.fetch(cfs[0].discordMsgID)
                .then((foundMessage: any) => {
                    repMessage = foundMessage;
                })
            }            
        }

        let ut: Utils = new Utils();
        await ut.postConfession(await ut.buildConfessionMsg(confessionObj.msg, confessionObj.msg.embeds[0].description, confessionRepID[0].confessionRepID), repMessage)
        .then((res: any) => {
            confessionObj.discordMsgID = res.id;
            db.approveConfession(confessionObj);
            confessionObj.msg.delete();
        }).catch((err: any) => {
            console.log("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
            console.log("Chi tiết lỗi: `" + err + "`");
        });              
    }

    denyCFS(confessionObj: any) {
        db.denyConfession(confessionObj);
        confessionObj.msg.delete();
    }
}