export class TTSpeaker {

    commands: Map<String, () => void> | undefined;

    TTSpeaker() {
        this.commands = new Map();
        this.commands.set("play", this.play);
        this.commands.set("stop", this.stop);
        this.commands.set("queue", this.queue);
        this.commands.set("skip", this.skip);
        this.commands.set("speak", this.speak);
    }
    
    exec(command: string) {
        
    }

    play() {}
    stop() {}
    queue() {}
    skip() {}
    speak() {}
}