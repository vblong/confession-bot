import { prefix, minimumConfessionLength } from "../../config";
import { bot } from "../../main";
const dm = require('../../data/data_manager');
const exec = require('../../cmd-exec');

export class DMModule {
    constructor() {
        
    }

    async process(msg: any) {
      if(msg.author.id != bot.user.id) {
          console.log(`------${msg.author.username} sends: ${msg.content}`);
          /**
           * If the message is from the bot then move to command section
           */
          if(msg.content.startsWith(prefix)) {
            exec.exec(bot, msg);
            return;
          }

          let allPrefixes = await dm.getUsedPrefixes();
          allPrefixes.forEach((p: any) => {
            console.log(`Prefix:`);
            console.log(p);
          });
      }
    }
}