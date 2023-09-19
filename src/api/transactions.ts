import { Transaction } from "@prisma/client"

import { FidorInternalTransfer } from "@/@types/fidor"
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
	}),
})

export const { useCreateAppTransactionMutation, useCreateFidorInternalTransferMutation } = transfers
