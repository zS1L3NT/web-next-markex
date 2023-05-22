import { arrayOf, type } from "arktype"

import { FidorAccount, FidorCollection, FidorPageableCollection } from "@/@types/fidor"
import { SessionUser } from "@/@types/iron-session"
import api, { ensureResponseType } from "@/api/api"

const users = api.injectEndpoints({
	endpoints: builder => ({
		getFidorAccounts: builder.query<FidorCollection<typeof FidorAccount.infer>, void>({
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

export const { useGetFidorAccountsQuery, useLazyGetFidorAccountsQuery, useUpdateAppUserMutation } =
	users
