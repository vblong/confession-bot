import { BaseModule } from "../BaseModule";
import { helpPostConfession, helpSetConfessionID } from "./confession-module-doc";

export class ConfessionModule extends BaseModule {
    constructor() {
        super();
        this.commands.set("cfs", {commandName: "cfs", commandHelp: helpPostConfession, commandFunc: this.setConfessionId});
        this.commands.set("setconfessionid", {commandName: "setconfessionid", commandHelp: helpSetConfessionID, commandFunc: this.setConfessionId});
        this.commands.set("setpendingid", {commandName: "setpendingid", commandHelp: helpSetConfessionID, commandFunc: this.setConfessionId});
    }

    postConfessino(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {
    
    }

    setConfessionId(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }

    setPendingID(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }

    approveCFS(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }

    denyCFS(ref: ConfessionModule, args: string[] = [], msg: any = undefined) {

    }
}