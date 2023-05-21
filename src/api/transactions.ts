import { arrayOf, type } from "arktype"

import {
	FidorCollection, FidorInternalTransfer, FidorPageableCollection, FidorTransaction
} from "@/@types/fidor"
import api, { ensureResponseType } from "@/api/api"

const transfers = api.injectEndpoints({
	endpoints: builder => ({
		createInternalTransfer: builder.mutation<
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
		getInternalTransfers: builder.query<
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
		getInternalTransfer: builder.query<typeof FidorInternalTransfer.infer, { id: string }>({
			query: ({ id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers/" + id,
				method: "GET",
				auth: true
			}),
			transformResponse: ensureResponseType(FidorInternalTransfer)
		}),
		getTransactions: builder.query<FidorCollection<typeof FidorTransaction.infer>, void>({
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
		getTransaction: builder.query<typeof FidorTransaction.infer, { id: string }>({
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
