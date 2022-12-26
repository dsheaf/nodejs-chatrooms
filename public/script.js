const socket = io('http://localhost:8080');
const compose = document.getElementById('compose');
const message = document.getElementById('message');
const messages = document.getElementById('messages');
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
name = name;
appendmessage('Welcome to ' + sanitize(room));
appendmessage('You joined as <b>' + sanitize(name) + '</b>');
rsocket.emit('new-user', name);

rsocket.on('message', data => {
	appendmessage("<b>" + sanitize(data.name) + ":</b> " + sanitize(data.message));
})
rsocket.on('user-connected', name => {
	appendmessage("<b>" + sanitize(name) + "</b> connected");
})
rsocket.on('user-disconnected', name => {
	appendmessage("<b>" + sanitize(name) + "</b> disconnected");
})

compose.addEventListener('submit', e => {
	e.preventDefault();
	appendmessage('<b><i>You:</i></b> ' + sanitize(message.value))
	rsocket.emit('send-message', message.value);
	message.value = '';
})

function appendmessage(message) {
	const messageelem = document.createElement('div');
	messageelem.innerHTML = message;
	messages.append(messageelem);
}
