export interface BaseCommand {
    commandName: string;
    commandHelp: string;
    commandFunc: (args?: any) => any;
    commandType?: CommandType;
}

export enum CommandType {
    Reply,
    Moderate
}