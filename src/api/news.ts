import { arrayOf, type } from "arktype"

import { FXEmpireEvent, FXEmpireHistory } from "@/@types/fxempire"
import { FXStreetNews } from "@/@types/fxstreet"
import api, { ensureResponseType } from "@/api/api"
import { CURRENCY, FXEMPIRE_COUNTRIES } from "@/constants"

const news = api.injectEndpoints({
	endpoints: builder => ({
		getFXStreetNews: builder.query<FXStreetNews[], void>({
			query: () => ({
				url: "https://50dev6p9k0-1.algolianet.com/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.25.1%3Binstantsearch.js%202.6.3%3BJS%20Helper%202.24.0&x-algolia-application-id=50DEV6P9K0&x-algolia-api-key=cd2dd138c8d64f40f6d06a60508312b0",
				method: "POST",
				body: {
					requests: [
						{
							indexName: "FxsIndexPro",
							params: new URLSearchParams({
								hitsPerPage: "9",
								filters:
									"CultureName:en AND (Category:'News' OR Category:'Breaking News' OR Category:'Premium News')",
							}).toString(),
						},
					],
				},
			}),
			transformResponse: res =>
				ensureResponseType(arrayOf(FXStreetNews))(res.results[0].hits),
		}),
		getFXEmpireEvents: builder.query<
			{
				events: [string, FXEmpireEvent[]][]
				next: boolean
			},
			{
				page: number
				from: Date
				to: Date
				impact: number
				countries: FXEMPIRE_COUNTRIES[CURRENCY][]
			}
		>({
			query: ({ page, from, to, impact, countries }) => ({
				url:
					"https://www.fxempire.com/api/v1/en/economic-calendar?" +
					new URLSearchParams({
						dateFrom: [...from.toLocaleDateString().split("/").reverse()].join("-"),
						dateTo: [...to.toLocaleDateString().split("/").reverse()].join("-"),
						country: countries.join(","),
						page: page + "",
						timezone: "Asia/Singapore",
						impact: Array(4 - impact)
							.fill(0)
							.map((_, i) => 3 - i)
							.join(","),
						categoryGroup:
							"gdp,markets,business,government,climate,money,housing,calendar,taxes,prices,consumer,labour,trade,health",
					}).toString(),
				method: "GET",
			}),
			transformResponse: res =>
				ensureResponseType(
					type({
						events: arrayOf(["string", arrayOf(FXEmpireEvent)]),
						next: "boolean",
					}),
				)({
					events: res.calendar.map((c: any) => [c.day, c.events]),
					next: !res.last,
				}),
		}),
		getFXEmpireHistory: builder.query<FXEmpireHistory, { country: string; category: string }>({
			query: ({ country, category }) => ({
				url: `https://www.fxempire.com/api/v1/en/macro-indicators/${country}/${category}/summary-history?latest=12`,
				method: "GET",
			}),
			transformResponse: ensureResponseType(FXEmpireHistory),
		}),
	}),
})

export const {
	useGetFXEmpireEventsQuery,
	useGetFXEmpireHistoryQuery,
	useGetFXStreetNewsQuery,
	useLazyGetFXEmpireEventsQuery,
	useLazyGetFXEmpireHistoryQuery,
	useLazyGetFXStreetNewsQuery,
} = news
