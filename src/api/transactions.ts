import { arrayOf, type } from "arktype"

import {
	FidorCollection, FidorInternalTransfer, FidorPageableCollection, FidorTransaction
} from "@/@types/fidor"
import api, { ensureResponseType } from "@/api/api"

const transfers = api.injectEndpoints({
	endpoints: builder => ({
		createFidorInternalTransfer: builder.mutation<
			typeof FidorInternalTransfer.infer,
			typeof FidorInternalTransfer.infer
		>({
			query: transfer => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
				method: "POST",
				body: transfer,
				auth: true
			}),
			transformResponse: ensureResponseType(FidorInternalTransfer)
		}),
		getFidorInternalTransfers: builder.query<
			FidorCollection<typeof FidorInternalTransfer.infer>,
			void
		>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorInternalTransfer),
					collection: FidorPageableCollection
				})
			)
		}),
		getFidorInternalTransfer: builder.query<typeof FidorInternalTransfer.infer, { id: string }>(
			{
				query: ({ id }) => ({
					url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers/" + id,
					method: "GET",
					auth: true
				}),
				transformResponse: ensureResponseType(FidorInternalTransfer)
			}
		),
		getFidorTransactions: builder.query<FidorCollection<typeof FidorTransaction.infer>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions",
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorTransaction),
					collection: FidorPageableCollection
				})
			)
		}),
		getFidorTransaction: builder.query<typeof FidorTransaction.infer, { id: string }>({
			query: ({ id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions/" + id,
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(FidorTransaction)
		})
	})
})

export const {
	useCreateFidorInternalTransferMutation,
	useGetFidorInternalTransferQuery,
	useGetFidorInternalTransfersQuery,
	useGetFidorTransactionQuery,
	useGetFidorTransactionsQuery,
	useLazyGetFidorInternalTransferQuery,
	useLazyGetFidorInternalTransfersQuery,
	useLazyGetFidorTransactionQuery,
	useLazyGetFidorTransactionsQuery
} = transfers
