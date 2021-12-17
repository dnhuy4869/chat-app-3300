import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';

import './Chat.css';

let socket;

const Chat = () => {
	const ENDPOINT = 'https://chat-app-3300.herokuapp.com/';

	const [name, setName] = useState('');
	const [room, setRoom] = useState('');
	const [users, setUsers] = useState('');

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);

	const location = useLocation();

	useEffect(() => {
		const { name, room } = queryString.parse(location.search);

		socket = io(ENDPOINT, { transports: ['websocket'] });

		setName(name);
		setRoom(room);

		socket.emit('join', { name, room }, () => {

		});

		return () => {
			socket.emit('disconnect');
			socket.off();
		}
	}, [ENDPOINT, location.search])

	useEffect(() => {
		socket.on('message', (message) => {
			setMessages([...messages, message]);
		})

		socket.on("roomData", ({ users }) => {
			setUsers(users);
		});
	}, [messages, users])

	const sendMessage = (e) => {
		e.preventDefault();

		if (message) {
			socket.emit('sendMessage', message, () => setMessage(''));
		}
	}

	console.log(message, messages);

	return (
		<div className='outerContainer'>
			<div className='container'>
				<InfoBar room={room}></InfoBar>
				<Messages messages={messages} name={name}></Messages>
				<Input message={message} setMessage={setMessage} sendMessage={sendMessage}></Input>
			</div>

			<TextContainer users={users} />
		</div>
	)
}

export default Chat;