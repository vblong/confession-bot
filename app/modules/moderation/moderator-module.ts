import { BaseModule } from "../BaseModule";
import { clearHelp, helpGeneral } from "./moderator-module-help-doc";
const Discord = require("discord.js");

export class Moderator extends BaseModule {
    constructor() {
        super();
        this.commands.set("help", {commandName: "help", commandHelp: helpGeneral, commandFunc: this.help});
        this.commands.set("clear", {commandName: "clear", commandHelp: clearHelp, commandFunc: this.clear});
    }

    clear(ref: Moderator, args: String[] = [], msg: any = undefined) {
        console.log("TODO play");
    }

    help(ref: Moderator, args: String[] = [], msg: any = undefined) {
        let commandNeedHelp = (args.length === 0 ? "" : args[0]);
        const embed = new Discord.MessageEmbed();
        embed.setColor("#A62019");

        console.log(`???1 ${commandNeedHelp}`);
        //  Send general help guide
        if(commandNeedHelp === "") {
            embed.setDescription(helpGeneral);
        } else {
            let helpDoc: String = ref.getHelp(args[0]);
            embed.setDescription(helpDoc);
        }
        
        //  Send help guide for a specific command
        msg.channel.send(embed);
    }

    getHelp(command: String, msg: any = undefined): String {
        if(this.commands.has(command) === false) {
            return `Unknown command \`${command}\``;
        }

        let help = this.commands.get(command)?.commandHelp;
        if(help !== undefined) {
            return help;
        }

        return `Command \`${command}\`'s help guide is not yet written.`;
    }
}