const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Socket } = require('dgram');
const { response } = require('express');
const { request } = require('http');
const chatUser = require('./chatUser');
const onlineStatus = require('./onlineStatus');
// var findUser = null;

//Array of all users
var allChatUsers = [];
var socketIDAndUserName = new Object();


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//SCOPE: CONNECTION
io.on('connection', (socket) => {
  console.log('a user connected');
  
  //SCOPE: FUNCTIONS
  //SCOPE: Update client contacts list
  function updateClientContacts() {
    

  }

  function updateGlobalUsers() {
    io.emit('updateGlobal', allChatUsers.map(a =>  { 
      return {name: a.name, isOnline: a.isOnline};//Send only name and online status
    }));

    // TEST:
    // console.log(allChatUsers.map(a => a.name));
  }

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
  
  function addSocketIDandUserNameForOnlineStatus(socketIDToAdd, name){
    socketIDAndUserName[socketIDToAdd.toString()] = name;

    updateUsersOnlineStatus(name);
  }

  function updateUsersOnlineStatus(name){
    var findUser = allChatUsers.filter(e => e.name == name);
    
    //Look if name is found in socketIDAndUserName list, if found
    if(Object.values(socketIDAndUserName).includes(name)){
      //then user is online
      allChatUsers[allChatUsers.indexOf(findUser[0])].isOnline = true;
    }
    else{//offline
      allChatUsers[allChatUsers.indexOf(findUser[0])].isOnline = false;
    }
  }

  //SCOPE: SOCKETS
  //SCOPE: DISCONNECTED
  socket.on('disconnect', (param) => {
    //DONE: update online status via socket id
    deleteSocketIDForOnlineStatus(socket.id);
    
    updateGlobalUsers();
    
    //TEST:
    // io.emit('alertUser', "someone disconnected soc ID: " + socket.id );
  });


  //SCOPE: All in one client update
  function updateUserPage() {//FOCUS4
    updateClientContacts();
    updateGlobalUsers();
  }

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
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
      var newUser = new chatUser(userInfo.name, userInfo.password, []);
      allChatUsers.push(newUser);
      
      socket.emit('alertUser', "You have succesfully signed up");

      
      //SCOPE: SIGN THE USER IN
      socket.emit("makeLogInRequest");
      

      //TEST:
      console.log({ currentUser: newUser, allUser: allChatUsers });
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

        //Update current users online status object
        addSocketIDandUserNameForOnlineStatus(socket.id, findUser[0].name);

        socket.emit('redirectMainPage');
        updateUserPage();//FOCUS 3

        //TEST:
        console.log({ currentUser: findUser[0], allUser: allChatUsers });
        // console.log(allChatUsers);
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