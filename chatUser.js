class chatUser {
    constructor(name, password, contacts) {
        //NOTE: TEMPORARY ID GENERATOR
        this.id = new Date().getTime();
        this.name = name;
        this.password = password;
        this.contacts = contacts;
    }
}

module.exports = chatUser;