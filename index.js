const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));
server.listen(8080);

const users = {};

io.on('connection', socket => {
	socket.on('send-message', message => {
		socket.broadcast.emit('message', { message: message, name: users[socket.id] });
	})
	socket.on('new-user', name => {
		users[socket.id] = name;
		socket.broadcast.emit('user-connected', name);
	})
	socket.on('disconnect', name => {
		socket.broadcast.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
	})
	socket.on('new-channel', name => {
		socket.broadcast.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
	})
	socket.on('delete-channel', name => {
		socket.broadcast.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
	})
})

/*
var rooms = io.of(/^.*$/);

rooms.on('connection', socket => {
		console.log("connection!")
	const namespace = socket.nsp;
	socket.on('send-message', message => {
		rooms.emit('message', { message: message, name: users[socket.id] });
	})
	socket.on('new-user', name => {
		users[socket.id] = name;
		rooms.emit('user-connected', name);
	})
	socket.on('disconnect', name => {
		rooms.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
	})
	socket.on('new-channel', name => {
		rooms.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
	})
	socket.on('delete-channel', name => {
		rooms.emit('user-disconnected', users[socket.id]);
		delete users[socket.id];
	})
})
*/
