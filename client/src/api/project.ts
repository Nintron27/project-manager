import axios from 'axios';

const url = 'api/project/';

export async function getUnassignedUsers(projectID: string, jwt: string) {
	const response = await axios.get(url + projectID + '/unassigned', {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getAssigned(projectID: string, jwt: string) {
	const response = await axios.get(url + projectID + '/assigned' , {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function getRoles(projectID: string, jwt: string) {
	const response = await axios.get(url + projectID + '/role', {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function addUserToProject(projectID: string, userID: string, roleID: string, jwt: string) {
	const response = await axios.post(`${url}${projectID}/user`,
		{
			_id: userID,
			role: roleID,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function editProjectUser(projectID: string, userID: string, roleID: string, jwt: string) {
	const response = await axios.put(`${url}${projectID}/user/${userID}`,
		{
			role: roleID,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function removeUserFromProject(projectID: string, userID: string, jwt: string) {
	const response = await axios.delete(`${url}${projectID}/user/${userID}`, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function postProject(name: string, description: string, jwt: string) {
	const response = await axios.post(url,
		{
			name,
			description,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function postProjectRole(projectID: string, name: string, permissions: string[], jwt: string) {
	const response = await axios.post(`${url}${projectID}/role`,
		{
			name,
			permissions,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function editProjectRole(projectID: string, roleID: string, name: string, permissions: string[], jwt: string) {
	const response = await axios.put(`${url}${projectID}/role/${roleID}`,
		{
			name,
			permissions,
		},
		{
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}

export async function deleteProjectRole(projectID: string, roleID: string, jwt: string) {
	const response = await axios.delete(`${url}${projectID}/role/${roleID}`, {
		headers: {
			Authorization: 'Bearer ' + jwt,
		},
	});

	return response.data;
}
