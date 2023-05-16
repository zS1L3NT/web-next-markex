import api from "@/api/api"

const prices = api.injectEndpoints({
	endpoints: builder => ({
		getCandles: builder.query<
			{ time: Date; mid: { o: number; c: number; h: number; l: number } }[],
			{ currencies: string; period: "H1" | "D" | "M" | "Y" }
		>({
			query: ({ currencies, period }) => ({
				url:
					"https://dashboard.acuitytrading.com/OandaPriceApi/GetCandles?apikey=" +
					process.env.NEXT_PUBLIC_OANDA_API_KEY,
				method: "POST",
				body: new URLSearchParams({
					region: "OAP",
					instrumentName: currencies,
					granularity: period
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}),
			transformResponse: data =>
				data.candles.map((c: any) => ({ time: new Date(c.time), mid: c.mid }))
		})
	})
})

export const { useGetCandlesQuery, useLazyGetCandlesQuery } = prices
