import { BaseModule } from "../BaseModule";
import { clearHelp } from "./moderator-module-help-doc";

export class Moderator extends BaseModule {
    constructor() {
        super();
        this.commands.set("clear", {commandName: "clear", commandHelp: clearHelp, commandFunc: this.clear});
    }

    clear(ref: Moderator, args: string[] = [], msg: any = undefined) {
        console.log("TODO play");

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

}