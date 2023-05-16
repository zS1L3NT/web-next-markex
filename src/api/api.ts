import axiosBaseQuery from "@/utils/axiosBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"

export type RequireToken = {
	token: string
}

const api = createApi({
	reducerPath: "api",
	baseQuery: axiosBaseQuery,
	endpoints: () => ({})
})

export default api
