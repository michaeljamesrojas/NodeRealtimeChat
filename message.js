class Message {
    constructor(sender, message, receiver){
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
    }
}

module.exports = Message;