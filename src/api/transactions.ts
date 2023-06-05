import { arrayOf, type } from "arktype"

import { Transaction } from "@prisma/client"

import { FidorCollection, FidorInternalTransfer, FidorPageableCollection } from "@/@types/fidor"
import api, { ensureResponseType } from "@/api/api"

const transfers = api.injectEndpoints({
	endpoints: builder => ({
		createAppTransaction: builder.mutation<
			Transaction,
			Omit<Transaction, "user_id" | "created_at">
		>({
			query: body => ({
				url: "/api/transactions",
				method: "POST",
				body,
				auth: true,
			}),
		}),
		createFidorInternalTransfer: builder.mutation<FidorInternalTransfer, FidorInternalTransfer>(
			{
				query: transfer => ({
					url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
					method: "POST",
					body: transfer,
					proxy: true,
					auth: true,
				}),
				transformResponse: ensureResponseType(FidorInternalTransfer),
			},
		),
		getFidorInternalTransfers: builder.query<FidorCollection<FidorInternalTransfer>, void>({
			query: () => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers?per_page=100",
				method: "GET",
				proxy: true,
				auth: true,
			}),
			transformResponse: ensureResponseType(
				type({
					data: arrayOf(FidorInternalTransfer),
					collection: FidorPageableCollection,
				}),
			),
		}),
	}),
})

export const {
	useCreateAppTransactionMutation,
	useCreateFidorInternalTransferMutation,
	useGetFidorInternalTransfersQuery,
	useLazyGetFidorInternalTransfersQuery,
} = transfers
