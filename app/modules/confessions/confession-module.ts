import { BaseModule } from "../BaseModule";
import { helpPostConfession, helpRepCFS, helpSetConfessionID } from "./confession-module-doc";
import { db, bot } from '../../main';
import { Utils } from "../../utils";

export class ConfessionModule extends BaseModule {
    constructor() {
        super();
        this.commands.set("cfs", {commandName: "cfs", commandHelp: helpPostConfession, commandFunc: this.setConfessionId});
        this.commands.set("setconfessionid", {commandName: "setconfessionid", commandHelp: helpSetConfessionID, commandFunc: this.setConfessionId});
        this.commands.set("setpendingid", {commandName: "setpendingid", commandHelp: helpSetConfessionID, commandFunc: this.setConfessionId});
        this.commands.set("rep", {commandName: "rep", commandHelp: helpRepCFS, commandFunc: this.repCFS});
    }

    postConfession(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {
    
    }

    setConfessionId(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }

    setPendingID(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }

    approveCFS(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }

    denyCFS(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }    

    async repCFS(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {
        if(msg.channel.type !== 'dm') return;

        if(args.length <= 1) {
            msg.channel.send("Vui lòng không gửi confession trống.");
            return;
        }
    
        let cfsNr = parseInt(args[0]);
        if(isNaN(cfsNr)) {
            msg.channel.send("ID confession không hợp lệ")
            return;
        }
        
        let contentStr = "";
        for(let i = 1 ; i < args.length ; i++) contentStr += args[i] + " ";
    
        if(msg.attachments.size === 0 && contentStr.length < 10) {
            msg.channel.send("Vui lòng không gửi confession quá ngắn.");
            return;
        }
    
        let cfs: any = await db.getConfessionId(cfsNr);
        if(cfs.length === 0) {
            msg.channel.send("Đã xảy ra lỗi, vui lòng liên hệ developer.\nLỗi: `không tìm thấy Confession số " + cfsNr + "`");
            return;
        }
    
        let dino: any = bot.guilds.cache.find((g: any) => g.id === cfs[0].serverID);
        let pendingChannelID: any = await db.getConfessionPendingID(cfs[0].serverID);
        let ut: Utils = new Utils();
        /**
         * NO PENDING
         * Server has not specified any pending channel for confession
         * So we gonna post the confession directly to the confession channel
         */
        if(pendingChannelID[0].ID === null) {
            let confessionChannelID: any = await db.getConfessionChannelID(cfs[0].serverID);
            let chan: any = dino.channels.cache.find((c: any) => c.id === confessionChannelID[0].ID);
            if(chan === undefined) {
                msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `Không tìm thấy confession channel`");
            }
            
            chan.messages.fetch(cfs.discordMsgID)
            .then(async (foundMessage: any) => { 
                if(foundMessage) {
                    ut.postConfession(await ut.buildConfessionMsg(msg, contentStr, cfsNr), foundMessage)
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
                        ut.saveConfession(obj, cfs[0].serverID); 
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
            let confessionChannelID: any = await db.getConfessionChannelID(cfs[0].serverID);
            let chan: any = dino.channels.cache.find((c: any) => c.id === confessionChannelID[0].ID);
            if(chan === undefined) {
                msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer.\nLỗi: `Không tìm thấy pending channel`");
                return;
            }
            await ut.postPendingConfession(await ut.buildPendingConfessionMsg(msg, contentStr, cfsNr))
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
                ut.saveConfession(obj, cfs[0].serverID, false);    
            })
            .catch((err: any) => {
                msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
                msg.channel.send("Chi tiết lỗi: `" + err + "`");
            });      
            return;
        }
    }
}