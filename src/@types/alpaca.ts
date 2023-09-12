import { type } from "arktype"

export type AlpacaSymbol = typeof AlpacaSymbol.infer
export const AlpacaSymbol = type({
	name: "string",
	symbol: "string",
	status: "string",
	exchange: "string",
	class: "string",
	tradable: "boolean",
})
