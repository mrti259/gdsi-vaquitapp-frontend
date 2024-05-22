import { env } from '$env/dynamic/private';
import { getAuthHeader } from '$lib/auth';
import { error, type Cookies } from '@sveltejs/kit';

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT';
type Headers = { [key: string]: string };
type Request = {
	path: string;
	data?: object;
	headers?: Headers;
};
type Opts = {
	method: Method;
	headers: Headers;
	body?: string;
};

const base = env.VITE_API_URL;

async function send(method: Method, { path, data, headers = {} }: Request) {
	const opts: Opts = { method, headers };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	const res = await fetch(`${base}/${path}`, opts);
	if (res.ok) {
		const text = await res.text();
		return text ? JSON.parse(text) : {};
	}

	throw error(res.status);
}

function get(path: string, headers?: Headers) {
	return send('GET', { path, headers });
}

function del(path: string, headers?: Headers) {
	return send('DELETE', { path, headers });
}

function post(path: string, data: object, headers?: Headers) {
	return send('POST', { path, data, headers });
}

function put(path: string, data: object, headers?: Headers) {
	return send('PUT', { path, data, headers });
}

export const userService = {
	register: (data: { email: string; password: string }) => post('user/register', data),
	login: (data: { email: string; password: string }) => post('user/login', data)
};
export const groupService = {
	save: (data: Group, cookies: Cookies) =>
		data.id > 0
			? put(`group/${data.id}`, data, getAuthHeader(cookies))
			: post('group', data, getAuthHeader(cookies)),
	list: (cookies: Cookies) => get('group', getAuthHeader(cookies)),
	get: (id: Id, cookies: Cookies) => get(`group/${id}`, getAuthHeader(cookies))
};
export const spendingService = {
	save: (data: Spending, cookies: Cookies) =>
		data.id > 0
			? put(`spending/${data.id}`, data, getAuthHeader(cookies))
			: post('spending', data, getAuthHeader(cookies)),
	list: (groupId: Id, cookies: Cookies) => get(`group/${groupId}/spending`, getAuthHeader(cookies))
};
export const budgetService = {
	save: (data: Budget, cookies: Cookies) =>
		data.id > 0
			? put(`budget/${data.id}`, data, getAuthHeader(cookies))
			: post('budget', data, getAuthHeader(cookies)),
	get: (id: Id, cookies: Cookies) => get(`budget/${id}`, getAuthHeader(cookies)),
	list: (groupId: Id, cookies: Cookies) => get(`group/${groupId}/budget`, getAuthHeader(cookies))
};
export const categoryService = {
	save: (data: Category, cookies: Cookies) =>
		data.id > 0
			? put(`category/${data.id}`, data, getAuthHeader(cookies))
			: post('category', data, getAuthHeader(cookies)),
	get: (id: Id, cookies: Cookies) => get(`category/${id}`, getAuthHeader(cookies)),
	list: (groupId: Id, cookies: Cookies) => get(`category/${groupId}`, getAuthHeader(cookies))
};