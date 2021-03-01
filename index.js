const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Socket } = require('dgram');
const { response } = require('express');
const { request } = require('http');
const chatUser = require('./chatUser');
const onlineStatus = require('./onlineStatus');
const message = require('./message');

// var findUser = null;

//Array of all users
var allChatUsers = [];
var socketIDAndUserName = new Object();
var conversations = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//SCOPE: CONNECTION
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('showLogIn');

  //NOTE: Is this good to update globaly every timeframe?
  // setInterval(() => {
  //   updateGlobalUsers();
  // }, 300);

  //SCOPE: FUNCTIONS
  //SCOPE: Update client contacts list

  function updateGlobalUsers() {
    io.emit('updateGlobal', allChatUsers.map(a =>  { 
      //Send only name and online status
      return {name: a.name, isOnline: a.isOnline};
    }));

    // TEST:
    // console.log(allChatUsers.map(a => a.name));
  }

  //SCOPE: Update contact list of user
  function updateContactList(username){
    
    var findUser = allChatUsers.filter(chatUser => chatUser.name == username);
    
    //TEST
    console.log('finduser result for request of client: ' + username);
    console.log(findUser);

    var contacts = findUser[0].contacts;
    //DONE: get the contact names of this username and their corresponding online statuses
    var param = {forUser:username, contactNames: contacts, 
      onlineStatuses:
      allChatUsers.map(a =>  { 
        //DONE: Send only name and online status
        if(contacts.includes(a.name)){
          return {isOnline: a.isOnline};
        }
      }).filter(a=>a != undefined)//DONE: remove undefine resulting map array
      
    };
    //Send only the list of contacts and their status
    io.emit('updateContactList', param);

    //Whenever someone update contacts then update global also
    updateGlobalUsers();

    //TEST:
    console.log('This is in the server');
    console.log(allChatUsers);
    console.log('and this is to send');
    console.log(param);

  }

  //SCOPE: socket deleter from list
  function deleteSocketIDForOnlineStatus(socketID){

    // get username of disconnecting socket
    var name = socketIDAndUserName[socketID.toString()];
    
    //Remove socketID in list wether exist or not
    delete socketIDAndUserName[socketID.toString()];
    
    //DONE: if a username is paired with the socket
    if(name != undefined){
      updateUsersOnlineStatus(name);
    }//else then socket connection is not signed in
    
  }
  
  //SCOPE: socket to username relation adder
  function addSocketIDandUserNameForOnlineStatus(socketIDToAdd, name){
    socketIDAndUserName[socketIDToAdd.toString()] = name;

    updateUsersOnlineStatus(name);
  }

  //SCOPE: Update user online status
  function updateUsersOnlineStatus(name){
    var findUser = allChatUsers.filter(e => e.name == name);
    
    //Look if name is found in socketIDAndUserName list, if found
    if(Object.values(socketIDAndUserName).includes(name)){
      //then user is online
      // allChatUsers[allChatUsers.indexOf(findUser[0])].isOnline = true;
      findUser[0].isOnline = true;
    }
    else{//offline
      // allChatUsers[allChatUsers.indexOf(findUser[0])].isOnline = false;
      findUser[0].isOnline = false;
    }

    //DONE Broadcast users online status and broadcast global changed
    broadcastUserStatusChanged(name);

    updateGlobalUsers();//UNFIN?
  }

  function broadcastUserStatusChanged(name){
    io.emit('someoneChangedStatus', name);
  }
  

  //SCOPE: SOCKETS
  //SCOPE: DISCONNECTED
  socket.on('disconnect', (param) => {
    //DONE: update online status via socket id
    deleteSocketIDForOnlineStatus(socket.id);
    
    //TEST:
    // io.emit('alertUser', "someone disconnected soc ID: " + socket.id );
  });

  //SCOPE: clientRequestUpdateContact
  socket.on('clientRequestUpdateContact', (name)=>{
    updateContactList(name);
  });
  
  //SCOPE: clientSendMessageTo
  socket.on('clientSendMessageTo', (param)=>{
    var messageObj = new message(param.sender, param.message, param.sendTo);

    //DONE: Accept the client message request by
    //finding the client from all the user
    var findUser = allChatUsers.filter(e => e.name == param.sender);
    //then add it to the conversations list

    //FOCUS every push must update the two talking person
    conversations.push(messageObj);
    // addToConversations(messageObj);//Make a general function for trigger

    //then update the client about all its messages to the person of interest
    socket.emit('updateConversationHistory', returnAllConversationsOfAAndB(param.sender, param.sendTo));

    //TEST
    // console.log(conversations);
    //TEST
    //Send all the messages
  });
  
  function returnAllConversationsOfAAndB(a , b){
    //DONE Filter out and only return conversations with a and b
    var toReturn =  conversations.filter((eachMessage) => 
    {
      if((eachMessage.sender == a || eachMessage.sender == b) && (eachMessage.receiver == a || eachMessage.receiver == b))
      {
        return eachMessage;
      } 
    });

    return toReturn;
    //TEST
    // console.log("AB func convo filter result");
    // console.log(toReturn);
    // console.log("return all the conversations");
    // console.log(conversations);
  }

  //SCOPE: clientAskForConversationHistory 
  socket.on('clientAskForConversationHistory', (param)=>{
    //UNFIN totest
    socket.emit('updateConversationHistory', returnAllConversationsOfAAndB(param.clientName, param.conversationWith));
  });

  //SCOPE: add to contact of current user
  socket.on('addToContacts', (param) => {
    var findUser = allChatUsers.filter(e => (e.name == param.currentUserName) );
    //DONE: add to contacts of current user if not already added
    if (!findUser[0].contacts.includes(param.addToContact)){
      findUser[0].contacts.push(param.addToContact);
    }
    
    updateContactList(param.currentUserName);
    
    //TEST:
    console.log(param);
  });



  //SCOPE client message to server
  socket.on('clientMessage', (message) =>{
    console.log(message);
  });

  //SCOPE: SIGNUP
  socket.on('signUp', (userInfo) => {
    //DONE: or SignUP user to list of all users

    //DONE: Search for the incoming user in the list of all user
    var findUser = allChatUsers.filter(e => e.name == userInfo.name);

    //DONE: If username found on list
    if (findUser.length > 0) {
      socket.emit('alertUser', "Username: '" + userInfo.name + "' already taken.");
    }
    else {
      //Create new user object
      var newUser = new chatUser(userInfo.name, userInfo.password);
      allChatUsers.push(newUser);
      
      socket.emit('alertUser', "You have succesfully signed up");

      
      //SCOPE: SIGN THE USER IN
      socket.emit("makeLogInRequest");
      

      //TEST:
      // console.log({ currentUser: newUser, allUser: allChatUsers });
      // console.log(allChatUsers);

    }
  });

  //SCOPE: Login
  socket.on('logIn', (userInfo) => {
    //DONE: login the user if already exist 
    //DONE: if with correct credentials (name and pass).

    //DONE: Search for the incoming user in the list of all user
    var findUser = allChatUsers.filter(e => e.name == userInfo.name);

    //DONE: If username found on list
    if (findUser.length > 0) {
      //DONE: and password is correct
      if (findUser[0].password == userInfo.password) {
        socket.emit('alertUser', "Signing you in...");
        socket.emit('redirectMainPage', {name: findUser[0].name, contacts: findUser[0].contacts});

        //Update current users online status object
        addSocketIDandUserNameForOnlineStatus(socket.id, findUser[0].name);
      } else {
        socket.emit('alertUser', "Incorrect password for user " + userInfo.name);
      }
    }
    else {
      socket.emit('alertUser', "No such username found");
    }
  });

});



//Port listening
const port = process.env.PORT;
http.listen(port || 3000, () => {
  console.log('Server started. Listening on port:' + process.env.PORT);
});