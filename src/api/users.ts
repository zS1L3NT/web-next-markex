import { FidorAccount, FidorCollection, FidorCustomer, FidorUser } from "@/@types/fidor"
import api, { RequireToken } from "@/api/api"

const users = api.injectEndpoints({
	endpoints: builder => ({
		getCustomers: builder.query<FidorCollection<typeof FidorCustomer.infer>, RequireToken>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/customers",
				method: "GET",
				token
			})
		}),
		getCurrentUser: builder.query<typeof FidorUser.infer, RequireToken>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/users/current",
				method: "GET",
				token
			})
		}),
		getAccounts: builder.query<FidorCollection<typeof FidorAccount.infer>, RequireToken>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/accounts",
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
