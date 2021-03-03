export class Server {
    _serverID: string;
    _serverName: string;
    _ownerID: string;
    _confessionChannel: string;

    constructor() {
        this._serverID = "";
        this._ownerID = "";
        this._confessionChannel = "";
        this._serverName = "";
    }
    
    get serverName(): string {
        return this._serverName;
    }
    set serverName(value: string) {
        this._serverName = value;
    }
    get serverID() {
        return this._serverID;
    }
    set serverID(value) {
        this._serverID = value;
    }
    
    get ownerID() {
        return this._ownerID;
    }
    set ownerID(value) {
        this._ownerID = value;
    }
    
    get confessionChannel() {
        return this._confessionChannel;
    }
    set confessionChannel(value) {
        this._confessionChannel = value;
    }
}