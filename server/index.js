const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const router = require('./router');
const { addUser, removeUsers, getUsers, getUsersInRoom, addUsers } = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

server.listen(PORT, () => {
	console.log(`server has started on port ${PORT}`);
})

io.on('connection', (socket) => {
	socket.on('join', ({ name, room }, callback) => {
		const { error, user } = addUsers({ id: socket.id, name, room });
		if (error) {
			return callback(error);
		}

		socket.emit('message', {
			user: 'admin',
			text: `${user.name}, welcome to the ${user.room} room`
		})

		socket.broadcast.to(user.room).emit('message', {
			user: 'admin',
			text: `${user.name} has joined.`
		})

		socket.join(user.room);

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})

		callback();
	})

	socket.on('sendMessage', (message, callback) => {
		const user = getUsers(socket.id);

		io.to(user?.room).emit('message', {
			user: user?.name,
			text: message
		});

		io.to(user?.room).emit('roomData', {
			room: user?.room,
			users: getUsersInRoom(user?.room)
		});

		callback();
	})

	socket.on('disconnect', () => {
		const user = removeUsers(socket.id);
		if (user) {
			io.to(user.room).emit('message', {
				user: 'admin',
				text: `${user.name} has left`
			})
		}
	})
})

