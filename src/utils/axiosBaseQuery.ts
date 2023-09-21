import axios, { AxiosError, AxiosRequestConfig } from "axios"

import { BaseQueryFn } from "@reduxjs/toolkit/dist/query"

export default (async config => {
	try {
		const result = await axios({
			url: config.url,
			method: config.method,
			data: config.body,
			params: config.params,
			headers: config.headers,
		})
		return { data: result.data }
	} catch (e) {
		const error = <AxiosError>e
		if (error.config?.url !== "https://apm.tp.sandbox.fidorfzco.com/oauth/authorize") {
			console.error(error)
		}

		return { error }
	}
}) satisfies BaseQueryFn<
	{
		url: string
		method: AxiosRequestConfig["method"]
		body?: AxiosRequestConfig["data"]
		params?: AxiosRequestConfig["params"]
		headers?: AxiosRequestConfig["headers"]
		auth?: boolean
	},
	unknown,
	AxiosError
>
