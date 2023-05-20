import { type } from "arktype"

export const OandaPrice = type({
	s: "number",
	b: "number",
	l: "number",
	h: "number",
	c: "number",
	sp: "number"
})

export const OandaCandle = type({
	time: "string",
	mid: {
		o: "number",
		c: "number",
		h: "number",
		l: "number"
	}
})
