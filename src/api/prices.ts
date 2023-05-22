import { arrayOf } from "arktype"

import { OandaCandle, OandaPrice } from "@/@types/oanda"
import api, { ensureResponseType } from "@/api/api"

const prices = api.injectEndpoints({
	endpoints: builder => ({
		getOandaPrice: builder.query<typeof OandaPrice.infer, { currencyPair: string }>({
			query: ({ currencyPair }) => ({
				url:
					"https://dashboard.acuitytrading.com/OandaPriceApi/GetPrice?apikey=" +
					process.env.NEXT_PUBLIC_OANDA_API_KEY,
				method: "POST",
				body: new URLSearchParams({
					region: "OAP",
					instrumentName: currencyPair
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}),
			transformResponse: ensureResponseType(OandaPrice)
		}),
		getOandaCandles: builder.query<
			(typeof OandaCandle.infer)[],
			{ currencyPair: string; period: "H1" | "D" | "W" | "M" }
		>({
			query: ({ currencyPair, period }) => ({
				url:
					"https://dashboard.acuitytrading.com/OandaPriceApi/GetCandles?apikey=" +
					process.env.NEXT_PUBLIC_OANDA_API_KEY,
				method: "POST",
				body: new URLSearchParams({
					region: "OAP",
					instrumentName: currencyPair,
					granularity: period
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}),
			transformResponse: res => ensureResponseType(arrayOf(OandaCandle))(res.candles)
		})
	})
})

export const {
	useGetOandaCandlesQuery,
	useGetOandaPriceQuery,
	useLazyGetOandaCandlesQuery,
	useLazyGetOandaPriceQuery
} = prices
