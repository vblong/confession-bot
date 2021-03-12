import { prefix, minimumConfessionLength } from "../../config";
import { bot } from "../../main";
const dm = require('../../data/data_manager');
const exec = require('../../cmd-exec');
const f = require('../../functions');

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

          /**
           * Prevent too short messages
           */
          // if(msg.content.length < minimumConfessionLength) {
          //   msg.channel.send("Vui lòng không gửi confession quá ngắn");
          //   return;
          // }
          
          // await f.postConfession(bot, await f.buildConfessionMsg(msg, msg.content))
          // .then((result: any) => {
          //   msg.channel.send("Đã đăng confession thành công.");
          //   let obj: any = {
          //     author: {
          //       username: msg.author.username,
          //       id: msg.author.id
          //     },
          //     content: msg.content,
          //     id: result.id
          //   };
          //   f.saveConfession(bot, obj, s[0].serverID);    
          // }).catch((err: any) => {
          //   msg.channel.send("Đã xảy ra lỗi. Vui lòng liên hệ developer. Dùng lệnh `#help` để xem hướng dẫn sử dụng bot.");
          //   msg.channel.send("Chi tiết lỗi: `" + err + "`");
          // });      
          // return;
      }
    }
}