import axios from 'axios';

const url = 'api/ticket/';

// export async function postTicket(
// 	ticket: {
// 		title: string;
// 		type: string;
// 		severity: string;
// 		description: string;
// 	},
// 	projectID: string,
// 	jwt: string
// ) {
// 	const response = await axios.post(url + projectID, ticket, {
// 		headers: {
// 			auth: jwt,
// 		},
// 	});

// 	return response.data;
// }

export async function getTicket(ticketID: string, jwt: string) {
	const response = await axios.get(url + ticketID, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getTickets(projectID: string, jwt: string) {
	const response = await axios.get(url + 'project/' + projectID, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getAssignedTickets(projectID: string, jwt: string) {
	const response = await axios.get(`${url}assigned/${projectID}`, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getUnassignedTickets(projectID: string, jwt: string) {
	const response = await axios.get(`${url}unassigned/${projectID}`, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getActiveTickets(projectID: string, jwt: string) {
	const response = await axios.get(`${url}active/${projectID}`, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getClosedTickets(projectID: string, jwt: string) {
	const response = await axios.get(`${url}closed/${projectID}`, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function postTicket(
	ticket: {
		project: string;
		title: string;
		type: string;
		severity: string;
		description: string;
	},
	jwt: string
) {
	const response = await axios.post(url + ticket.project, ticket, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function postComment(projectID: string, text: string, ticketID: string, jwt: string) {
	const response = await axios.post(`${url}${projectID}/${ticketID}/comment`,
		{
			text,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function attachImageToTicket(
	projectID: string,
	ticketID: string,
	formData: FormData,
	jwt: string
) {
	const response = await axios.post(`${url}${projectID}/${ticketID}/attachment`, formData, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function editTicket(projectID: string, status: string, severity: string, type: string, ticketID: string, jwt: string) {
	const response = await axios.put(url + projectID + '/' + ticketID,
		{
			status,
			severity,
			type,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function removeUserFromTicket(projectID: string, ticketID: string, userID: string, jwt: string) {
	const response = await axios.delete(`${url}${projectID}/${ticketID}/user/${userID}`,
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getEligibleUsers(projectID: string, ticketID: string, jwt: string) {
	const response = await axios.get(`${url}${projectID}/eligibleusers/${ticketID}`,
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function assignUserToTicket(projectID: string, ticketID: string, userID: string, jwt: string) {
	const response = await axios.post(`${url}${projectID}/${ticketID}/user/${userID}`, {}, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}
