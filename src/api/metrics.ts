import { FinnhubMetric } from "@/@types/finnhub"
import api, { ensureResponseType } from "@/api/api"

const metrics = api.injectEndpoints({
	endpoints: builder => ({
		getMetrics: builder.query<FinnhubMetric, { symbol: string }>({
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
	}),
})

export const { useGetMetricsQuery, useLazyGetMetricsQuery } = metrics
