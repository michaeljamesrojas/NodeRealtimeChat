const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const chatUser = require('./chatUser');

//Array of all users
var allChatUsers = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//Socket operations
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  socket.on('signUp', (userInfo) => {
    //DONE: or SignUP user to list of all users if not already exist 
    //UNFIN: with correct constraints (i.e. correct username and password input)
    if(allChatUsers.filter(e => e.name == userInfo.name).length > 0){
      socket.emit('alertUser',"Username: '" + userInfo.name + "' already taken.");
    }
    else{
      var newUser = new chatUser(Math.random(),userInfo.name, userInfo.pass);
      allChatUsers.push(newUser);
      
      //TEST: 
      socket.emit('alertUser',"You have succesfully signed up");
      console.log("ALL USERS" + allChatUsers);
    }
  });
  
  socket.on('logIn', (userInfo) => {
    //DONE: login the user if already exist 
    //UNFIN: with correct credentials (name and pass).

    var findUser = allChatUsers.filter(e => e.name == userInfo.name);
    if(findUser.length > 0){
      if (findUser[0].pass === userInfo.pass) {
        socket.emit('alertUser',"Signing you in...");
      } else {
        
      }
    }
    else{
      socket.emit('alertUser',"No such username found");
    }
  });

});

//Port listening
const port = process.env.PORT;
http.listen(port || 3000, () => {
  console.log('Server started. Listening on port:' + process.env.PORT);
});