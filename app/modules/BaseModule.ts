import { BaseCommand } from "./BaseCommand";

export abstract class BaseModule {

    commands: Map<string, BaseCommand> = new Map();

    constructor() {
        this.commands = new Map();
    }
    
    exec(command: string, args: string[] = [], msg: any = undefined): void {
        if(this.commands.has(command) === false) {
            console.log(`Unknown command \`${command}\``);
            return;
        }

        let func: any = this.commands.get(command)?.commandFunc;
        func(this, args, msg);
    }

    getCommands(): Map<string, BaseCommand> { return this.commands; }
}