import { arrayOf, type } from "arktype"

import {
	FidorAccount, FidorCollection, FidorCustomer, FidorPageableCollection, FidorUser
} from "@/@types/fidor"
import { SessionUser } from "@/@types/iron-session"
import api, { ensureResponseType } from "@/api/api"

const users = api.injectEndpoints({
	endpoints: builder => ({
		getCustomers: builder.query<FidorCollection<typeof FidorCustomer.infer>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/customers",
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorCustomer),
					collection: FidorPageableCollection
				})
			)
		}),
		getCurrentUser: builder.query<typeof FidorUser.infer, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/users/current",
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(FidorUser)
		}),
		getAccounts: builder.query<FidorCollection<typeof FidorAccount.infer>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/accounts",
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorAccount),
					collection: FidorPageableCollection
				})
			)
		}),
		updateAppUser: builder.mutation<
			SessionUser["app"],
			Partial<Exclude<SessionUser["app"], "transactions">>
		>({
			query: user => ({
				path: "/api/user",
				method: "PUT",
				body: user,
				auth: true
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
	useLazyGetCustomersQuery,
	useUpdateAppUserMutation
} = users