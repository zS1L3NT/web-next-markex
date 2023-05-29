import { arrayOf, type } from "arktype"

import { FidorAccount, FidorCollection, FidorPageableCollection } from "@/@types/fidor"
import { User } from "@/@types/types"
import api, { ensureResponseType } from "@/api/api"

const users = api.injectEndpoints({
	endpoints: builder => ({
		getFidorAvailable: builder.query<undefined, void>({
			query: () => ({
				url: "https://apm.tp.sandbox.fidorfzco.com/oauth/authorize",
				method: "GET"
			}),
			transformErrorResponse: error => error.status === 503
		}),
		getFidorAccounts: builder.query<FidorCollection<FidorAccount>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/accounts",
				method: "GET",
				proxy: true,
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorAccount),
					collection: FidorPageableCollection
				})
			)
		}),
		updateAppUser: builder.mutation<User["app"], Partial<Exclude<User["app"], "transactions">>>(
			{
				query: user => ({
					url: "/api/user",
					method: "PUT",
					body: user,
					auth: true
				})
			}
		)
	})
})

export const {
	useGetFidorAccountsQuery,
	useGetFidorAvailableQuery,
	useLazyGetFidorAccountsQuery,
	useLazyGetFidorAvailableQuery,
	useUpdateAppUserMutation
} = users
