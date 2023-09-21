import { arrayOf, union } from "arktype"

import { FinnhubEarnings, FinnhubMetric, FinnhubTrend } from "@/@types/finnhub"
import { OandaChartData } from "@/@types/oanda"
import api, { ensureResponseType } from "@/api/api"
import { CURRENCY_PAIR } from "@/constants"

const extras = api.injectEndpoints({
	endpoints: builder => ({
		getFinnhubMetrics: builder.query<FinnhubMetric, { symbol: string }>({
			query: ({ symbol }) => ({
				url:
					"https://finnhub.io/api/v1/stock/metric?" +
					new URLSearchParams({
						symbol: symbol,
						metric: "metric",
						token: `${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
					}).toString(),
				method: "GET",
			}),
			transformResponse: res => ensureResponseType(FinnhubMetric)(res.metric),
		}),
		getFinnhubTrends: builder.query<FinnhubTrend[], { symbol: string }>({
			query: ({ symbol }) => ({
				url:
					"https://finnhub.io/api/v1/stock/recommendation?" +
					new URLSearchParams({
						symbol: symbol,
						token: `${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
					}).toString(),
				method: "GET",
			}),
			transformResponse: ensureResponseType(arrayOf(FinnhubTrend)),
		}),
		getFinnhubEarnings: builder.query<FinnhubEarnings[], { startDate: Date; endDate: Date }>({
			query: ({ startDate, endDate }) => ({
				url:
					"https://finnhub.io/api/v1/calendar/earnings?" +
					new URLSearchParams({
						from: [...startDate.toLocaleDateString().split("/").reverse()].join("-"),
						to: [...endDate.toLocaleDateString().split("/").reverse()].join("-"),
						token: `${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
					}).toString(),
				method: "GET",
			}),
			transformResponse: res =>
				ensureResponseType(arrayOf(FinnhubEarnings))(res.earningsCalendar),
		}),
		getOandaChartsData: builder.query<OandaChartData[] | null, { currencyPair: CURRENCY_PAIR }>(
			{
				query: ({ currencyPair }) => ({
					url:
						"https://dashboard.acuitytrading.com/SentimentApi/GetInstrumentChartsData?apikey=" +
						process.env.NEXT_PUBLIC_OANDA_API_KEY,
					method: "POST",
					body: new URLSearchParams({
						instrumentName: currencyPair,
						region: "OAP",
					}).toString(),
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}),
				transformResponse: res =>
					ensureResponseType(union(arrayOf(OandaChartData), "null"))(res || null),
			},
		),
	}),
})

export const {
	useGetFinnhubEarningsQuery,
	useGetFinnhubMetricsQuery,
	useGetFinnhubTrendsQuery,
	useGetOandaChartsDataQuery,
	useLazyGetFinnhubEarningsQuery,
	useLazyGetFinnhubMetricsQuery,
	useLazyGetFinnhubTrendsQuery,
	useLazyGetOandaChartsDataQuery,
} = extras
