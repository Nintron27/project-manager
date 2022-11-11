import axios from 'axios';

const url = 'api/user/';

export async function register(
	username: string,
	email: string,
	password: string
) {
	const response = await axios.post(url, {
		username,
		email,
		password,
	});

	return response;
}

export async function login(email: string, password: string) {
	const response = await axios.post(url + 'login', { email, password });
	const userObject = await axios.get(url + 'userdata', {
		headers: {
			Authorization: 'Bearer ' + response.headers.authorization,
		},
	});

	return userObject.data;
}

export async function readNotifications(jwt: string) {
	const response = await axios.post(url + 'notifications/read', {}, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getNotifications(jwt: string) {
	const response = await axios.get(url + 'notifications', {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function deleteNotifications(jwt: string) {
	const response = await axios.delete(url + 'notifications', {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function deleteNotification(notificationID: string, jwt: string) {
	const response = await axios.delete(url + 'notifications/' + notificationID, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}
