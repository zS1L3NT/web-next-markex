import { FidorCollection, FidorInternalTransfer, FidorSepaCreditTransfer } from "@/@types/fidor"
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
		createSEPACreditTransfer: builder.mutation<
			typeof FidorSepaCreditTransfer.infer,
			typeof FidorSepaCreditTransfer.infer & RequireToken
		>({
			query: ({ token, ...transfer }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/sepa_credit_transfers",
				method: "POST",
				body: transfer,
				token
			})
		}),
		getSEPACreditTransfers: builder.query<
			FidorCollection<typeof FidorSepaCreditTransfer.infer>,
			RequireToken
		>({
			query: ({ token }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/sepa_credit_transfers",
				method: "GET",
				token
			})
		}),
		getSEPACreditTransfer: builder.query<
			typeof FidorSepaCreditTransfer.infer,
			RequireToken & { id: string }
		>({
			query: ({ token, id }) => ({
				url: "https://api.tp.sandbox.fidorfzco.com/sepa_credit_transfers/" + id,
				method: "GET",
				token
			})
		})
	})
})

export const {
	useCreateInternalTransferMutation,
	useCreateSEPACreditTransferMutation,
	useGetInternalTransferQuery,
	useGetInternalTransfersQuery,
	useGetSEPACreditTransferQuery,
	useGetSEPACreditTransfersQuery,
	useLazyGetInternalTransferQuery,
	useLazyGetInternalTransfersQuery,
	useLazyGetSEPACreditTransferQuery,
	useLazyGetSEPACreditTransfersQuery
} = transfers
