// onlineStatus = require('./onlineStatus');

//TODO: Use database instead
class chatUser {
    constructor(name, password) {
        //NOTE: TEMPORARY ID GENERATOR
        this.id = new Date().getTime();
        this.name = name;
        this.password = password;
        this.contacts = new Array();
        this.isOnline = false;
        this.notifications = new Object();//TODO: Make this a class please
        //TEST:
        //Make a callback function
        // this.addConversation
        // this.onlineStatus = new onlineStatus();
    }
}

module.exports = chatUser;