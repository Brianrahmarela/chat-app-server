//CREATE SERVER USING EXPRESS
//require express, socketio & core module nodejs yaitu http
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users') 

const PORT = process.env.PORT || 5000;
//require router
const router = require('./router');

const app = express();
//buat servernya
const server = http.createServer(app);
//passing const server ke socketio(server)
// const io = socketio(server);

//panggil sebagai middleware
app.use(router);
app.use(cors());

corsOptions = {
  cors: true,
  origins:["http://localhost:3000"],
 }
 const io = socketio(server, corsOptions);
 

//INTEGRATIONG SOCKET.IO TO CLIENT
// (socket) artinya connected dgn client socket
io.on('connection', (socket) => {
  // console.log('a user connected!');

  //ambil data emit dari frontend dgn event yg sama dari emit('join)\
  //di arrow ambl data kiriman emit dgn lgsg destroction {name, room}
  //kasih param ke 2 yaitu callback di arrow socket.on
  socket.on('join', ({name, room}, callback) => {
    // console.log(name, room);
    //destrukurisasi
    const { error, user } = addUser({ id: socket.id, name, room});

    //akan trigger response setelh socket.on telah di emit (utk error handling)
    // const error = true;
    //ini jika ada error
    if(error) return callback(error);

    //buat emit event welcome message default ketika join. backend to frontend
    socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!`})

    //jika tdk ada error
    socket.join(user.room);

    io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

    //callback akan jalan jika error
    callback();
  });

  //buat event user generate messages, ini hanya di backend
  socket.on('sendMessage', (message, callback) => {
    //ini get user user yg send massge
    const user = getUser(socket.id);

    io.to(user.room).emit('message', {user: user.name, text: message});
    io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

    callback();
  });

  //buat jika disconnect dgn acuan param callback (socket)
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user){
      io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`})
    }
    // console.log('user had left!');
  });
});

//jalankan server & buat PORT nya
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));