import { BaseModule } from './modules/BaseModule';
import { ConfessionModule } from './modules/confessions/confession-module';
import { DocsModule } from './modules/docs/docs-module';
import { Moderator } from './modules/moderation/moderator-module';
import { TTSpeaker } from './modules/tts/ttspeaker-module';
import { config } from './main';

export class Shell {
    modules: Map<string, BaseModule> = new Map();

    constructor() {
        this.registerModules();
    }

    /** 
     *  Whenever you define more class. Register them here
     */
    registerModules() {
        this.modules.set("moderator", new Moderator());
        this.modules.set("ttspeaker", new TTSpeaker());
        this.modules.set("docsmodule", new DocsModule());
        this.modules.set("confession", new ConfessionModule());
    }

    process(cmd: string, args: any, msg: any) {
        let foundMessage: boolean = false;
        this.modules.forEach((module: BaseModule, moduleName: string) => {
            if(module.getCommands().has(cmd)) {
                console.log(`---Found command ${cmd}`);
                module.exec(cmd, args, msg);
                foundMessage = true;
                return;
            }
        });

        if(foundMessage === false)
            msg.channel.send(`Lệnh \`${cmd}\` không tồn tại. Gửi \`#help\` để xem hướng dẫn.`)
    }

    exec(msg: any) {
        /**
         * NO MATCHING PREFIXES FOUND
         */
        if(!msg.content.startsWith(config.prefix)) {
            console.info(`---INFO ${msg.author.username} sends: ${msg.content}`);
            return;
        }
        
        const args = msg.content.slice(config.prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();

        this.process(command, args, msg);
    }
}