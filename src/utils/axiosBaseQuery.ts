import { arrayOf, type } from "arktype"
import axios, { AxiosError, AxiosRequestConfig } from "axios"

import { BaseQueryFn } from "@reduxjs/toolkit/dist/query"

export const ApiError = type({
	message: "string",
	key: "string[]",
	code: "number",
	errors: arrayOf({
		field: "string",
		key: "string",
		message: "string"
	})
})

export default (async ({ url, method, body, params, token }) => {
	try {
		const result = await axios({
			url,
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method,
			params,
			data: body
		})
		return { data: result.data }
	} catch (e) {
		const error = <AxiosError>e
		console.error(error)

		const result = ApiError(error.response?.data)

		return {
			error: {
				message: result.data?.message ?? error.message,
				key: result.data?.key ?? [],
				code: result.data?.code ?? error.code ? +error.code! : 500,
				errors: result.data?.errors ?? []
			}
		}
	}
}) satisfies BaseQueryFn<
	{
		url: string
		method: AxiosRequestConfig["method"]
		body?: object
		params?: AxiosRequestConfig["params"]
		token?: string | null | undefined
	},
	unknown,
	typeof ApiError.infer
>
