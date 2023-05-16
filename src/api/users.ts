import { FidorAccount, FidorCollection, FidorCustomer, FidorUser } from "@/@types/fidor"
import api, { RequireToken } from "@/api/api"

const users = api.injectEndpoints({
	endpoints: builder => ({
		getCustomers: builder.query<FidorCollection<typeof FidorCustomer.infer>, RequireToken>({
			query: ({ token }) => ({
				url: process.env.VITE_PUBLIC_FIDOR_API_URI + "/customers",
				method: "GET",
				token
			})
		}),
		getCurrentUser: builder.query<typeof FidorUser.infer, RequireToken>({
			query: ({ token }) => ({
				url: process.env.VITE_PUBLIC_FIDOR_API_URI + "/users/current",
				method: "GET",
				token
			})
		}),
		getAccounts: builder.query<FidorCollection<typeof FidorAccount.infer>, RequireToken>({
			query: ({ token }) => ({
				url: process.env.VITE_PUBLIC_FIDOR_API_URI + "/accounts",
				method: "GET",
				token
			})
		})
	})
})

export const {
	useGetAccountsQuery,
	useGetCurrentUserQuery,
	useGetCustomersQuery,
	useLazyGetAccountsQuery,
	useLazyGetCurrentUserQuery,
	useLazyGetCustomersQuery
} = users
