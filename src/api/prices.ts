import { arrayOf } from "arktype"

import { OandaCandle, OandaPrice } from "@/@types/oanda"
import api, { ensureResponseType } from "@/api/api"
import { CURRENCY_PAIR } from "@/constants"

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
					instrumentName: currencyPair
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}),
			transformResponse: ensureResponseType(OandaPrice)
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
