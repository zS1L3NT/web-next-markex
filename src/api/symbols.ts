import { arrayOf } from "arktype"
import api, { ensureResponseType } from "@/api/api"
import { AlpacaSymbol } from "@/@types/alpaca"

const TRADING_API_ENDPOINT = "https://paper-api.alpaca.markets"
const headers = {
	"APCA-API-KEY-ID": process.env.APCA_API_KEY_ID,
	"APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY,
}
const symbols = api.injectEndpoints({
	endpoints: builder => ({
		getAlpacaSymbols: builder.query<AlpacaSymbol[], void>({
			query: () => ({
				url: `${TRADING_API_ENDPOINT}/v2/assets?status=active&class=us_equity&exchange=NASDAQ`,
				method: "GET",
				headers: headers,
			}),
			transformResponse: ensureResponseType(arrayOf(AlpacaSymbol)),
		}),
	}),
})

export const { useGetAlpacaSymbolsQuery, useLazyGetAlpacaSymbolsQuery } = symbols
