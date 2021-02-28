import axios from 'axios';

const API = axios.create({
	baseURL: process.env.API_URL,
	responseType: 'json',
});

const getRequestConfiguration = (authorization: string) => {
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': '',
	};

	if (authorization) headers.Authorization = `Bearer ${authorization}`

	return headers;
}
type Request = {
	url: string,
	values: string,
	successCallBack: (data: object) => null,
	failureCallBack: (error: object) => null,
	requestType: string,
	authorization: string,
}
export const makeRequest = (req: Request) => {
	const headers = getRequestConfiguration(req.authorization);
	let promise;

	switch (req.requestType) {
		case 'GET': promise = API.get(req.url, { headers }); break;
		case 'POST': promise = API.post(req.url, req.values, { headers }); break;
		case 'DELETE': promise = API.delete(req.url, { headers }); break;
		default: return;
	}

	promise.then((response: any) => {
		const { data } = response;
		req.successCallBack(data);
	}).catch((error: any) => {
		if (error.response)
			req.failureCallBack(error.response.data);
	});
}