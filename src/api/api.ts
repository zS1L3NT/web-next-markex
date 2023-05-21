import { Type } from "arktype"

import axiosBaseQuery from "@/utils/axiosBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"

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
	endpoints: () => ({})
})

export default api
