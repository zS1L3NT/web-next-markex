import { arrayOf, type } from "arktype"

import { AlpacaBar, AlpacaInterval, AlpacaQuote } from "@/@types/alpaca"
import { OandaCandle, OandaPrice } from "@/@types/oanda"
import api, { ensureResponseType } from "@/api/api"
import { CURRENCY_PAIR } from "@/constants"

const MARKET_API_ENDPOINT = "https://data.alpaca.markets/v2/stocks"

const prices = api.injectEndpoints({
	endpoints: builder => ({
		getOandaPrice: builder.query<OandaPrice, { currencyPair: CURRENCY_PAIR }>({
			query: ({ currencyPair }) => ({
				url:
					"https://dashboard.acuitytrading.com/OandaPriceApi/GetPrice?apikey=" +
					process.env.NEXT_PUBLIC_OANDA_API_KEY,
				method: "POST",
				body: new URLSearchParams({
					region: "OAP",
					instrumentName: currencyPair,
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}),
			transformResponse: ensureResponseType(OandaPrice),
		}),
		getOandaCandles: builder.query<
			OandaCandle[],
			{ currencyPair: CURRENCY_PAIR; period: "H1" | "D" | "W" | "M" }
		>({
			query: ({ currencyPair, period }) => ({
				url:
					"https://dashboard.acuitytrading.com/OandaPriceApi/GetCandles?apikey=" +
					process.env.NEXT_PUBLIC_OANDA_API_KEY,
				method: "POST",
				body: new URLSearchParams({
					region: "OAP",
					instrumentName: currencyPair,
					granularity: period,
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}),
			transformResponse: res => ensureResponseType(arrayOf(OandaCandle))(res.candles),
		}),
		getAlpacaLatestTrade: builder.query<{ trade: { p: number } }, { symbol: string }>({
			query: ({ symbol }) => ({
				url: `${MARKET_API_ENDPOINT}/${symbol}/trades/latest`,
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`,
				},
			}),
			transformResponse: res => ensureResponseType(type({ trade: { p: "number" } }))(res),
		}),
		getAlpacaLatestQuote: builder.query<
			{ quote: AlpacaQuote; symbol: string },
			{ symbol: string }
		>({
			query: ({ symbol }) => ({
				url: `${MARKET_API_ENDPOINT}/${symbol}/quotes/latest`,
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`,
				},
			}),
			transformResponse: res =>
				ensureResponseType(type({ quote: AlpacaQuote, symbol: "string" }))(res),
		}),
		getAlpacaCandles: builder.query<
			{
				next_page_token: string | null
				bars: AlpacaBar[]
			},
			{ symbol: string; interval: AlpacaInterval }
		>({
			query: ({ symbol, interval }) => ({
				url:
					`${MARKET_API_ENDPOINT}/${symbol}/bars?` +
					new URLSearchParams({
						timeframe: interval,
						start: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000) / 2).toISOString(),
					}).toString(),
				method: "GET",
				headers: {
					"Apca-Api-Key-Id": `${process.env.NEXT_PUBLIC_APCA_API_KEY_ID}`,
					"Apca-Api-Secret-Key": `${process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY}`,
				},
			}),
			transformResponse: res =>
				ensureResponseType(
					type({
						bars: arrayOf(AlpacaBar),
						next_page_token: "string|null",
						symbol: "string",
					}),
				)(res),
		}),
	}),
})

export const {
	useGetOandaPriceQuery,
	useGetAlpacaCandlesQuery,
	useGetAlpacaLatestQuoteQuery,
	useGetAlpacaLatestTradeQuery,
	useGetOandaCandlesQuery,
	useLazyGetOandaPriceQuery,
	useLazyGetAlpacaCandlesQuery,
	useLazyGetAlpacaLatestQuoteQuery,
	useLazyGetAlpacaLatestTradeQuery,
	useLazyGetOandaCandlesQuery,
} = prices
