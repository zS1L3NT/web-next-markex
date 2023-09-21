import { arrayOf } from "arktype"

import { FinnhubEarnings, FinnhubMetric, FinnhubTrend } from "@/@types/finnhub"
import api, { ensureResponseType } from "@/api/api"

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
	}),
})

export const {
	useGetFinnhubEarningsQuery,
	useGetFinnhubMetricsQuery,
	useGetFinnhubTrendsQuery,
	useLazyGetFinnhubEarningsQuery,
	useLazyGetFinnhubMetricsQuery,
	useLazyGetFinnhubTrendsQuery,
} = extras
