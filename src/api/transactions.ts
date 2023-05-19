import { FidorCollection, FidorInternalTransfer, FidorTransaction } from "@/@types/fidor"
import api, { RequireToken } from "@/api/api"

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
			})
		}),
		getInternalTransfers: builder.query<
			FidorCollection<typeof FidorInternalTransfer.infer>,
			RequireToken
		>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers",
				method: "GET",
				token
			})
		}),
		getInternalTransfer: builder.query<
			typeof FidorInternalTransfer.infer,
			RequireToken & { id: string }
		>({
			query: ({ token, id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/internal_transfers/" + id,
				method: "GET",
				token
			})
		}),
		getTransactions: builder.query<
			FidorCollection<typeof FidorTransaction.infer>,
			RequireToken
		>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions",
				method: "GET",
				token
			})
		}),
		getTransaction: builder.query<
			typeof FidorTransaction.infer,
			RequireToken & { id: string }
		>({
			query: ({ token, id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/transactions/" + id,
				method: "GET",
				token
			})
		}),
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
