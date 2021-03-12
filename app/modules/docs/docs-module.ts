import { BaseModule } from "../BaseModule";
import { botName, dedicatedServerName } from "../../config";
import { helpGeneral } from "./docs-module-help-doc";
const Discord = require("discord.js");

export class DocsModule extends BaseModule {
    constructor() {
        super();
        this.commands.set("help", {commandName: "help", commandHelp: helpGeneral, commandFunc: this.help});
      
    }

    help(ref: DocsModule, args: string[] = [], msg: any = undefined) {
        let commandNeedHelp = (args.length === 0 ? "" : args[0]);
        const embed = new Discord.MessageEmbed();
        embed.setColor("#A62019");

        //  Send general help guide
        if(commandNeedHelp === "") {
            embed.setDescription(helpGeneral);
        } else {
            // let helpDoc: string = ref.getHelp(args[0]);
            let helpDoc = `TODO get help documents from other modules`;
            embed.setDescription(helpDoc);
        }
        
        //  Send help guide for a specific command
        msg.channel.send(embed);
    }

    /** Uncomment when you need it */
    // getHelp(command: string, msg: any = undefined): string {
    //     if(this.commands.has(command) === false) {
    //         return `Unknown command \`${command}\``;
    //     }

    //     let help = this.commands.get(command)?.commandHelp;
    //     if(help !== undefined) {
    //         return help;
    //     }

    //     return `Command \`${command}\`'s help guide is not yet written.`;
    // }
}