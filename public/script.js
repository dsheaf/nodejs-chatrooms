const socket = io('http://localhost:8080');
const compose = document.getElementById('compose');
const newchatform = document.getElementById('new-chat-form');
const message = document.getElementById('message');
const messages = document.getElementById('messages');
const createchat = document.getElementById('create-chat');
const chatname = document.getElementById('chat-name');
const users = document.getElementById('users');
const badchars = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}
function sanitize(data) {
  return String(data).replace(/[&<>"'`=\/]/g, function (s) {
    return badchars[s];
  });
}

var room = window.location.hash;
//var rsocket = io("/" + room);
var rsocket = socket;
var name = prompt('Enter Username');
if ( room != "") {
socket.emit('join', room);
} else {
socket.emit('list-rooms');
}

rsocket.on('message', data => {
	appendmessage("<b>" + sanitize(data.name) + ":</b> " + sanitize(data.message));
})
rsocket.on('user-connected', name => {
	appendmessage("<b>" + sanitize(name) + "</b> connected");
})
rsocket.on('user-disconnected', name => {
	appendmessage("<b>" + sanitize(name) + "</b> disconnected");
})
socket.on('room-creation-success', name => {
	window.location.hash = name;
	socket.emit('join', name);
})
socket.on('room-list', rooms => {
	appendmessage('Known Rooms: ' + rooms);
	appendmessage('Join them using "Join Chat", or create a new one.');
})
socket.on('user-list', userlist => {
	users.innerHTML = "";
	userlist.forEach(function (user, id) {
		const userelem = document.createElement('div');
		if ( user == name ) {
			userelem.innerHTML = "<b><i>" + user + "</i></b>";
		} else {
			userelem.innerHTML = "<b>" + user + "</b>";
		}
		users.append(userelem);
	});
})

socket.on('joined', roomname => {
	if ( roomname.success == false) {
			alert("Failed to change room\nName must be only a-zA-Z0-9.-_");
	} else {
	appendmessage('Welcome to ' + sanitize(roomname.name));
	appendmessage('You joined as <b>' + sanitize(name) + '</b>');
	document.title = roomname.name;
	room = roomname.name;
	rsocket.emit('new-user', name);
	}
})

compose.addEventListener('submit', e => {
	e.preventDefault();
	appendmessage('<b><i>You:</i></b> ' + sanitize(message.value))
	rsocket.emit('send-message', message.value);
	message.value = '';
})
newchatform.addEventListener('submit', e => {
	e.preventDefault();
	socket.emit('join', '#' + chatname.value);
	chatname.value = '';
})

function appendmessage(message) {
	const messageelem = document.createElement('div');
	messageelem.innerHTML = message;
	messages.append(messageelem);
}
