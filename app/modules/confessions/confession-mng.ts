import { bot, pendingChannelID } from "../../main";
const dm = require('../../data/data_manager');
const f = require('../../functions');
const main = require('../../main');
export class ConfessionManager {

    constructor() {}

    async approveCFS(confessionObj: any) {
        console.log(`After approve or deny: ${confessionObj.messageID}`);
        let confessionRepID = await dm.getConfessionInfoByMsgID(confessionObj.messageID, "confessionRepID");
        let id = await dm.getHighestConfessionId();
        if(id.ID === -1) id.ID = 0;
        confessionObj.confessionID = id.ID + 1;
        let repMessage: any = undefined;

        if(confessionRepID[0].confessionRepID > 0) {
            let cfs = await dm.getConfessionId(confessionRepID[0].confessionRepID);
            if(cfs !== undefined) {
                let dino: any = main.bot.guilds.cache.find((g: any) => g.id === cfs.serverID);
                let confessionChannelID = await dm.getConfessionChannelID();
                let chan: any = dino.channels.cache.find((c: any) => c.id === confessionChannelID.ID);
                await chan.messages.fetch(cfs.discordMsgID)
                .then((foundMessage: any) => {
                    repMessage = foundMessage;
                })
            }            
        }

        await f.postConfession(bot, await f.buildConfessionMsg(confessionObj.msg, confessionObj.msg.embeds[0].description, confessionRepID[0].confessionRepID), repMessage)
        .then((res: any) => {
            confessionObj.discordMsgID = res.id;
            dm.approveConfession(confessionObj);
            confessionObj.msg.delete();
        }).catch((err: any) => {
            console.log("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
            console.log("Chi tiết lỗi: `" + err + "`");
        });              
    }

    denyCFS(confessionObj: any) {
        dm.denyConfession(confessionObj);
        confessionObj.msg.delete();
    }
}