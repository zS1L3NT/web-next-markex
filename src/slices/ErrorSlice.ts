import { ApiError } from "@/utils/axiosBaseQuery"
import { createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit"

const slice = createSlice({
	name: "error",
	initialState: <typeof ApiError.infer | null>null,
	reducers: {
		setError: (state, action: PayloadAction<typeof ApiError.infer | SerializedError>) => {
			const result = ApiError(action.payload)
			if ("data" in result) {
				return result.data
			} else {
				console.error("SerializedError:", action.payload)

				const error = <SerializedError>action.payload
				return {
					message: error.message ?? "Unknown cause to error",
					key: [],
					code: -1,
					errors: []
				}
			}
		}
	}
})

export default slice.reducer
export const { setError } = slice.actions
