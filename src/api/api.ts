import { Type } from "arktype"

import { createApi } from "@reduxjs/toolkit/query/react"

import axiosBaseQuery from "@/utils/axiosBaseQuery"

export const ensureResponseType =
	<T>(type: Type<T>) =>
	(res: any) => {
		const result = type(res)
		if (result.problems) {
			console.error("Invalid API Response:", { result, res })
			throw new Error("Invalid API response: " + JSON.stringify(result.problems))
		}
		return result.data
	}

const api = createApi({
	reducerPath: "api",
	baseQuery: axiosBaseQuery,
	tagTypes: ["Bookmarks"],
	endpoints: () => ({}),
})

export default api
