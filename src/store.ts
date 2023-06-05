import { configureStore } from "@reduxjs/toolkit"

import api from "@/api/api"

const store = configureStore({
	reducer: {
		[api.reducerPath]: api.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
