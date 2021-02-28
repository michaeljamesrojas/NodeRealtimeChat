class onlineStatus {
    constructor(){
        this.isOnline = false;
        this.socketIDs = new Array();
    }

    updateOnlineStatus(){
        if(this.socketIDs.length <= 0){
            this.isOnline = false;
        }else
        {
            this.isOnline = true;
        }
    }

    addSocketID(socketIDToAdd){
        this.socketIDs.push(socketIDToAdd);
        this.updateOnlineStatus();
    };

    removeSocketID(socketIDToRemove){
        indexToRemove = this.socketIDs.indexOf(socketIDToRemove);
        
        if(indexToRemove != -1){
            this.socketIDs.splice(indexToRemove,1);
        }
        this.updateOnlineStatus();
    }
}

module.exports = onlineStatus;