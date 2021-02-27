const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { chatUser } = require('./chatUser');

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
  
  socket.on('signLogIn', (userInfo) => {
    //TEST:
    // console.log(userInfo);
    // socket.emit('alertUser', "Your info reached the server");

    //UNFIN: add user to list of all users if not already exist
    if(allChatUsers.filter(e => e.name === userInfo.name)){
      socket.emit('alertUser',"Welcome back " + userInfo.name);
    }
    //TODO: or simply login the user if already exist with correct credentials.

  });

});

//Port listening
const port = process.env.PORT;
http.listen(port || 3000, () => {
  console.log('Server started. Listening on port:' + process.env.PORT);
});