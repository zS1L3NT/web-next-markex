import { type } from "arktype"

export type OandaPrice = typeof OandaPrice.infer
export const OandaPrice = type({
	s: "number",
	b: "number",
	l: "number",
	h: "number",
	c: "number",
	sp: "number"
})

export type OandaCandle = typeof OandaCandle.infer
export const OandaCandle = type({
	time: "string",
	mid: {
		o: "number",
		c: "number",
		h: "number",
		l: "number"
	}
})
