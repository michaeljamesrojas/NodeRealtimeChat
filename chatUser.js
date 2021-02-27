class chatUser {
    constructor(id, name, password, contacts) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.contacts = contacts;
    }
}

module.exports.user = chatUser;