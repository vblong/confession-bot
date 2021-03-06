import { BaseCommand } from "./BaseCommand";

export abstract class BaseModule {

    commands: Map<String, BaseCommand> = new Map();

    constructor() {
        this.commands = new Map();
    }
    
    exec(command: String, args: String[] = [], msg: any = undefined): void {
        if(this.commands.has(command) === false) {
            console.log(`Unknown command \`${command}\``);
            return;
        }

        let func: any = this.commands.get(command)?.commandFunc;
        func(this, args, msg);
    }

    // getHelp(command: String, msg: any = undefined): String {
    //     if(this.commands.has(command) === false) {
    //         return `Unknown command \`${command}\``;
    //     }

    //     let help = this.commands.get(command)?.commandHelp;
    //     if(help !== undefined) {
    //         return help;
    //     }

    //     return `Command \`${command}\`'s help guide is not yet written.`;
    // }

    getCommands(): Map<String, BaseCommand> { return this.commands; }
}