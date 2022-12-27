const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));
server.listen(8080);

const users = {};
const room = {};

function listusers(where, who) {
	const userlist = [];
	if (io.of("/").adapter.rooms.get(where) != undefined ) {
	io.of("/").adapter.rooms.get(where).forEach(function (item, id) {
			userlist.push(users[item]);
	});
	io.in(where).emit('user-list', userlist);
	} else {
	return;
	}
}

io.on('connection', socket => {
	socket.on('join', name => {
		if ( /^#[a-zA-Z0-9.-_]+$/.test(name) ) {
		socket.leaveAll();
		socket.join(socket.id); //Fixes Duplication bug, not sure the reason for including it
		socket.join(name);
		room[socket.id] = name;
		socket.emit("joined", { name: name, success: true });
		} else {
		socket.emit("joined", { name: name, success: false });
		}
	})
	socket.on('change-chat', name => {
		registerroom("/" + name);
		socket.emit("room-change-success", name);
	})
	socket.on('list-rooms', () => {
			rooms = "";
			io.of("/").adapter.rooms.forEach(function (item, id) {
				if (/^#/.test(id)) {
						rooms = rooms + id + " ";
				}
			});
			socket.emit('room-list', rooms);
	})
	socket.on('list-users', room => {
			listusers(room, socket.id);
	})
	socket.on('send-message', message => {
		socket.to(room[socket.id]).emit('message', { message: message, name: users[socket.id] });
		console.log(io.of('/').adapter.rooms);
	})
	socket.on('new-user', name => {
		users[socket.id] = name;
		listusers(room[socket.id], socket.id);
		socket.to(room[socket.id]).emit('user-connected', name);
	})
	socket.on('disconnect', name => {
		socket.to(room[socket.id]).emit('user-disconnected', users[socket.id]);
		listusers(room[socket.id], socket.id);
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
