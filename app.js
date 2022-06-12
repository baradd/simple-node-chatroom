const express = require('express');
const { Server } = require('socket.io');

const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('./public'));

server.listen(3000, () => {
  console.log('Server is running');
});

let onlineUsers = [];
//*setup socket io
io.on('connection', (socket) => {
  let nickname;

  //@Desc initialize nickname and push it on online users
  socket.on('send nickname', (data) => {
    nickname = data.nickname;
    onlineUsers.push({ id: socket.id, nickname });
    socket.emit('online users', onlineUsers);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    //@Desc removing user from online user when it disconnect
    onlineUsers.forEach((user) => {
      let index;
      if (user.nickname === nickname) {
        index = onlineUsers.findIndex((obj) => {
          return obj.nickname === nickname;
        });
      }
      onlineUsers.splice(index, index + 1);
    });
    socket.emit('online users', onlineUsers);
  });

  //@Desc get message and send it again with nickname
  socket.on('send message', (data) => {
    socket.broadcast.emit('send message', { message: data.message, nickname });
    socket.emit('send message2', { message: data.message });
  });
});
