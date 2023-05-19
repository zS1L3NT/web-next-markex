import { arrayOf, type } from "arktype"

import {
	FidorCollection, FidorInternalTransfer, FidorPageableCollection, FidorTransaction
} from "@/@types/fidor"
import api, { ensureResponseType, RequireToken } from "@/api/api"

const transfers = api.injectEndpoints({
	endpoints: builder => ({
		createInternalTransfer: builder.mutation<
			typeof FidorInternalTransfer.infer,
			typeof FidorInternalTransfer.infer & RequireToken
		>({
			query: ({ token, ...transfer }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
				method: "POST",
				body: transfer,
				token
			}),
			transformResponse: ensureResponseType(FidorInternalTransfer)
		}),
		getInternalTransfers: builder.query<
			FidorCollection<typeof FidorInternalTransfer.infer>,
			RequireToken
		>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
				method: "GET",
				token
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorInternalTransfer),
					collection: FidorPageableCollection
				})
			)
		}),
		getInternalTransfer: builder.query<
			typeof FidorInternalTransfer.infer,
			RequireToken & { id: string }
		>({
			query: ({ token, id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers/" + id,
				method: "GET",
				token
			}),
			transformResponse: ensureResponseType(FidorInternalTransfer)
		}),
		getTransactions: builder.query<
			FidorCollection<typeof FidorTransaction.infer>,
			RequireToken
		>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions",
				method: "GET",
				token
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorTransaction),
					collection: FidorPageableCollection
				})
			)
		}),
		getTransaction: builder.query<typeof FidorTransaction.infer, RequireToken & { id: string }>(
			{
				query: ({ token, id }) => ({
					url: "https://api.tp.sandbox.fidorfzco.com/transactions/" + id,
					method: "GET",
					token
				}),
				transformResponse: ensureResponseType(FidorTransaction)
			}
		)
	})
})

export const {
	useCreateInternalTransferMutation,
	useGetInternalTransferQuery,
	useGetInternalTransfersQuery,
	useGetTransactionQuery,
	useGetTransactionsQuery,
	useLazyGetInternalTransferQuery,
	useLazyGetInternalTransfersQuery,
	useLazyGetTransactionQuery,
	useLazyGetTransactionsQuery
} = transfers
