import { botName, dedicatedServerName } from "../../config";

export const clearHelp = `
    Delete a number of old messages for you. The messages to be deleted should not be older than 14 days.
`;

export const helpGeneral = `Chào bạn, cám ơn bạn đã sử dụng bot **${botName}** :3
\n**${botName}** là bot gửi confession được phát triển dành riêng cho server **${dedicatedServerName}**.
\nĐể gửi confession thì bạn chỉ cần nhắn tin trực tiếp cho bot với nội dung confession là được, bạn cũng có thể gửi kèm ảnh.         
\nĐể gửi confession trả lời 1 confession khác thì bạn nhắn cho bot với cú pháp \`#rep <id> <nội dung>\` (không bao gồm 2 dấu <>).        
\nVí dụ, để rep confession số 1 thì bạn nhắn \`#rep 1 chào bạn\`.
\nTrong quá trình sử dụng, nếu có bất kì trục trặc, thắc mắc hay góp ý vui lòng liên hệ admin :3
\nChỉ thế thôi, chúc bạn chơi vui :3
`;