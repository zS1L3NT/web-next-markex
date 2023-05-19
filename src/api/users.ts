import { arrayOf, type } from "arktype"

import {
	FidorAccount, FidorCollection, FidorCustomer, FidorPageableCollection, FidorUser
} from "@/@types/fidor"
import api, { ensureResponseType, RequireToken } from "@/api/api"

const users = api.injectEndpoints({
	endpoints: builder => ({
		getCustomers: builder.query<FidorCollection<typeof FidorCustomer.infer>, RequireToken>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/customers",
				method: "GET",
				token
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorCustomer),
					collection: FidorPageableCollection
				})
			)
		}),
		getCurrentUser: builder.query<typeof FidorUser.infer, RequireToken>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/users/current",
				method: "GET",
				token
			}),
			transformResponse: ensureResponseType(FidorUser)
		}),
		getAccounts: builder.query<FidorCollection<typeof FidorAccount.infer>, RequireToken>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/accounts",
				method: "GET",
				token
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorAccount),
					collection: FidorPageableCollection
				})
			)
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
