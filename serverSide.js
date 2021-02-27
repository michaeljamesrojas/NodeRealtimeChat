const { user } = require('./chatUser');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const fs = require('fs');
// const files = fs.readdirSync('./');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // console.log('a user connected (Files:)' + files);
  new user().sayHi();

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

});

var port = process.env.PORT;
http.listen(port || 3000, () => {
  console.log('listening on port:' + process.env.PORT);
});