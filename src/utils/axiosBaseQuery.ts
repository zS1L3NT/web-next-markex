import { type } from "arktype"
import axios, { AxiosError, AxiosRequestConfig } from "axios"

import { BaseQueryFn } from "@reduxjs/toolkit/dist/query"

export type ApiError = typeof ApiError.infer
export const ApiError = type({
	type: "string",
	message: "string",
	details: "any"
})

export default (async config => {
	try {
		let result: any
		if (config.proxy) {
			result = await axios.post("/api/proxy", config)
		} else {
			result = await axios({
				url: config.url,
				method: config.method,
				data: config.body,
				params: config.params,
				headers: config.headers
			})
		}
		return { data: result.data }
	} catch (e) {
		const error = <AxiosError>e
		console.error(error)

		const result = ApiError(error.response?.data)
		return {
			error: {
				type: result.data?.type ?? "Unknown error",
				message: result.data?.message ?? error.message,
				details: result.data?.details ?? undefined
			}
		}
	}
}) satisfies BaseQueryFn<
	{
		url: string
		method: AxiosRequestConfig["method"]
		body?: AxiosRequestConfig["data"]
		params?: AxiosRequestConfig["params"]
		headers?: AxiosRequestConfig["headers"]
		proxy?: boolean
		auth?: boolean
	},
	unknown,
	ApiError
>
