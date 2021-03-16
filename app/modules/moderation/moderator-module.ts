import { Utils } from "../../utils";
import { db } from "../../main";
import { BaseModule } from "../BaseModule";
import { clearHelp, cfsidHelp, pendingidHelp } from "./moderator-module-help-doc";

export class Moderator extends BaseModule {
    private ut: Utils = new Utils();

    constructor() {
        super();
        this.commands.set("clear", {
            commandName: "clear", 
            commandHelp: clearHelp, 
            commandFunc: this.clear});
        this.commands.set("cfsid", {
            commandName: "cfsid", 
            commandHelp: cfsidHelp, 
            commandFunc: this.setConfessionChannelID});
        this.commands.set("cfspendingid", {
            commandName: "cfspendingid", 
            commandHelp: pendingidHelp, 
            commandFunc: this.setConfessionPendingID});
    }

    clear(ref: Moderator, args: string[] = [], msg: any = undefined) {
        let num = 2;
        if(args[0]) {
            num = parseInt(args[0]) + 1;
        }
        ref.clearMsg(num, msg);
    }

    
    clearMsg(num: number, msg: any) {
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

    setConfessionChannelID(ref: Moderator, args: string[] = [], msg: any = undefined) {
        let cfsID = args[0];
        let ownedServers = ref.ut.getOwnServers(msg.channel.recipient.id);
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
            let result = db.updateServerCFSIDOnDB(server);
            if(result) {
                msg.channel.send("Broadcast channel has been set up successfully");
            } else {
                msg.channel.send("Broadcast channel update failed. Please contact developer");
            }
        }
    }

    setConfessionPendingID(ref: Moderator, args: string[] = [], msg: any = undefined) {
        let pendingChannelID = args[0];let cfsID = args[0];
        let ownedServers = ref.ut.getOwnServers(msg.channel.recipient.id);
        let found: boolean = false;
        if(ownedServers.length === 0) {
            msg.reply("You must be a server's owner to do this command");
            return;
        }
    
        /** Find channel by channel's id */
        let server: any;
        ownedServers.forEach((g: any) => {
            g.channels.cache.forEach((v: any, k: any) => {
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
            let result = db.updateServerPendingCFSIDOnDB(server);
            if(result) {
                msg.channel.send("Pending confession channel has been set up successfully");
            } else {
                msg.channel.send("Pending confession channel update failed. Please contact developer");
            }
        }
    }
}