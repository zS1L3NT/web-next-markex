import { arrayOf, type } from "arktype"

import {
	FidorCollection, FidorInternalTransfer, FidorPageableCollection, FidorTransaction
} from "@/@types/fidor"
import api, { ensureResponseType } from "@/api/api"

const transfers = api.injectEndpoints({
	endpoints: builder => ({
		createFidorInternalTransfer: builder.mutation<FidorInternalTransfer, FidorInternalTransfer>(
			{
				query: transfer => ({
					url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
					method: "POST",
					body: transfer,
					proxy: true,
					auth: true
				}),
				transformResponse: ensureResponseType(FidorInternalTransfer)
			}
		),
		getFidorInternalTransfers: builder.query<FidorCollection<FidorInternalTransfer>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
				method: "GET",
				proxy: true,
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorInternalTransfer),
					collection: FidorPageableCollection
				})
			)
		}),
		getFidorInternalTransfer: builder.query<FidorInternalTransfer, { id: string }>({
			query: ({ id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers/" + id,
				method: "GET",
				proxy: true,
				auth: true
			}),
			transformResponse: ensureResponseType(FidorInternalTransfer)
		}),
		getFidorTransactions: builder.query<FidorCollection<FidorTransaction>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions",
				method: "GET",
				proxy: true,
				auth: true
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorTransaction),
					collection: FidorPageableCollection
				})
			)
		}),
		getFidorTransaction: builder.query<FidorTransaction, { id: string }>({
			query: ({ id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions/" + id,
				method: "GET",
				proxy: true,
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
