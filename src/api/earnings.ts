import { arrayOf } from "arktype"

import { FinnhubEarnings } from "@/@types/finnhub"
import api, { ensureResponseType } from "@/api/api"

const earnings = api.injectEndpoints({
	endpoints: builder => {
		return {
			getEarnings: builder.query<FinnhubEarnings[], { startDate: Date; endDate: Date }>({
				query: ({ startDate, endDate }) => ({
					url:
						"https://finnhub.io/api/v1/calendar/earnings?" +
						new URLSearchParams({
							from: [...startDate.toLocaleDateString().split("/").reverse()].join(
								"-",
							),
							to: [...endDate.toLocaleDateString().split("/").reverse()].join("-"),
							token: `${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
						}).toString(),
					method: "GET",
				}),
				transformResponse: res =>
					ensureResponseType(arrayOf(FinnhubEarnings))(res.earningsCalendar),
			}),
		}
	},
})

export const { useGetEarningsQuery, useLazyGetEarningsQuery } = earnings
