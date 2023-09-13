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

export type AlpacaBar = typeof AlpacaBar.infer
export const AlpacaBar = type({
	t: "string",
	o: "number",
	h: "number",
	l: "number",
	c: "number",
	v: "number",
	n: "number",
	vw: "number",
})

export type AlpacaInterval =
	| "1Min"
	| "5Min"
	| "15Min"
	| "30Min"
	| "1Hour"
	| "4Hour"
	| "1Day"
	| "1Week"
	| "1Month"
