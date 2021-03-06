import { BaseModule } from "../BaseModule";
import { playHelp, queueHelp, skipHelp, speakHelp, stopHelp } from "./ttspeaker-module-help-doc";

export class TTSpeaker extends BaseModule{
    constructor() {
        super();

        this.commands.set("play", {commandName: "play", commandHelp: playHelp, commandFunc: this.play});
        this.commands.set("stop", {commandName: "stop", commandHelp: stopHelp, commandFunc: this.stop});
        this.commands.set("queue", {commandName: "queue", commandHelp: queueHelp, commandFunc: this.queue});
        this.commands.set("skip", {commandName: "skip", commandHelp: skipHelp, commandFunc: this.skip});
        this.commands.set("speak", {commandName: "speak", commandHelp: speakHelp, commandFunc: this.speak});
    }

    play(ref: TTSpeaker, args: String[] = [], msg: any = undefined) {
        console.log(`TODO play - args: ${args}`);
    }

    stop(ref: TTSpeaker, args: String[] = [], msg: any = undefined) {
        console.log("TODO stop");
    }

    queue(ref: TTSpeaker, args: String[] = [], msg: any = undefined) {
        console.log("TODO queue");
    }

    skip(ref: TTSpeaker, args: String[] = [], msg: any = undefined) {
        console.log("TODO skip");
    }

    speak(ref: TTSpeaker, args: String[] = [], msg: any = undefined) {
        console.log("TODO speak");
    }
}