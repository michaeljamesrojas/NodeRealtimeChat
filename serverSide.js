// const { user } = require('./chatUser');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const fs = require('fs');
// const files = fs.readdirSync('./');


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
    socket.emit('alertUser', "Your infi reached the server");

    //TODO: add user to list of all users if not already exist
    //or simply login the user if already exist with correct credentials. 
  });

});

//Port listening
const port = process.env.PORT;
http.listen(port || 3000, () => {
  console.log('Server started. Listening on port:' + process.env.PORT);
});