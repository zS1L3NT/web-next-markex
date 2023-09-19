import { arrayOf } from "arktype"

import { FinnhubTrend } from "@/@types/finnhub"
import api, { ensureResponseType } from "@/api/api"

const trends = api.injectEndpoints({
	endpoints: builder => ({
		getTrends: builder.query<FinnhubTrend[], { symbol: string }>({
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
	}),
})

export const { useGetTrendsQuery, useLazyGetTrendsQuery } = trends
