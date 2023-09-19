import { arrayOf, type } from "arktype"

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

export type AlpacaLiveTrade = typeof AlpacaLiveTrade.infer
export const AlpacaLiveTrade = type({
	S: "string", // symbol
	T: "string", // message type
	c: arrayOf("string"), // trade condition
	i: "number", // trade_id
	p: "number", // trade_price
	s: "number", // trade_size
	t: "string", // trade_timestamp in rfc3339 format
	x: "string", // exchange code
	z: "string", // tape
})

export type AlpacaLiveQuote = typeof AlpacaLiveQuote.infer
export const AlpacaLiveQuote = type({
	T: "string", // message type
	S: "string", // symbol
	ax: "string", // ask exchange code
	ap: "number", // ask price
	as: "number", // ask size
	bx: "string", // bid exchange code
	bp: "number", // bid price
	bs: "number", // bid size
	c: arrayOf("string"), // trade condition
	t: "string", // trade timestamp in rfc3339 format
	z: "string", // tape
})

export type AlpacaQuote = typeof AlpacaQuote.infer
export const AlpacaQuote = type({
	t: "string",
	ax: "string",
	ap: "number",
	as: "number",
	bx: "string",
	bp: "number",
	bs: "number",
	c: arrayOf("string"),
	z: "string",
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
