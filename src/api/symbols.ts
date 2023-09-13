import { arrayOf } from "arktype"
import api, { ensureResponseType } from "@/api/api"
import { AlpacaSymbol } from "@/@types/alpaca"

const TRADING_API_ENDPOINT = "https://paper-api.alpaca.markets"

const symbols = api.injectEndpoints({
	endpoints: builder => ({
		getAlpacaSymbols: builder.query<AlpacaSymbol[], void>({
			query: () => ({
				url: `${TRADING_API_ENDPOINT}/v2/assets?` +
				new URLSearchParams({
					status: "active",
					class: "us_equity",
					exchange: "NASDAQ"
				}),
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`
				},
			}),
			transformResponse: ensureResponseType(arrayOf(AlpacaSymbol)),
		}),
		getAlpacaSymbol: builder.query<AlpacaSymbol, { symbol : string }>({
			query: ({ symbol }) => ({
				url: `${TRADING_API_ENDPOINT}/v2/assets/${symbol}`,
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`
				},
			}),
			transformResponse: ensureResponseType(AlpacaSymbol),
		})
	}),
})

export const { useGetAlpacaSymbolsQuery, useLazyGetAlpacaSymbolsQuery } = symbols
