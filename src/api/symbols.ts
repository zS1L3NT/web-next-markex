import { arrayOf, type } from "arktype"

import { AlpacaSymbol } from "@/@types/alpaca"
import { FXEmpireSearchResult } from "@/@types/fxempire"
import api, { ensureResponseType } from "@/api/api"

const TRADING_API_ENDPOINT = "https://paper-api.alpaca.markets"

const symbols = api.injectEndpoints({
	endpoints: builder => ({
		getAlpacaSymbols: builder.query<AlpacaSymbol[], void>({
			query: () => ({
				url:
					`${TRADING_API_ENDPOINT}/v2/assets?` +
					new URLSearchParams({
						status: "active",
						class: "us_equity",
						exchange: "NASDAQ",
					}),
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`,
				},
			}),
			transformResponse: ensureResponseType(arrayOf(AlpacaSymbol)),
		}),
		getAlpacaSymbol: builder.query<AlpacaSymbol, { symbol: string }>({
			query: ({ symbol }) => ({
				url: `${TRADING_API_ENDPOINT}/v2/assets/${symbol}`,
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`,
				},
			}),
			transformResponse: ensureResponseType(AlpacaSymbol),
		}),
		getFXEmpirePopularSymbols: builder.query<
			{ category: string; items: FXEmpireSearchResult[] },
			{ category: string; locale: string; size: number }
		>({
			query: ({ category, locale, size }) => ({
				url:
					"https://www.fxempire.com/api/v1/en/popular-searches?" +
					new URLSearchParams({
						category: category,
						locale: locale,
						size: size.toString(),
					}).toString(),
				method: "GET",
			}),
			transformResponse: ensureResponseType(
				type({ category: "string", items: arrayOf(FXEmpireSearchResult) }),
			),
		}),
	}),
})

export const {
	useGetAlpacaSymbolQuery,
	useGetAlpacaSymbolsQuery,
	useGetFXEmpirePopularSymbolsQuery,
	useLazyGetAlpacaSymbolQuery,
	useLazyGetAlpacaSymbolsQuery,
	useLazyGetFXEmpirePopularSymbolsQuery,
} = symbols
