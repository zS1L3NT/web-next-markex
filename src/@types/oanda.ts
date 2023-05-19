import { type } from "arktype"

export const OandaLivePrice = type({
	s: "number",
	b: "number",
	l: "number",
	h: "number"
})

export const OandaCandlePrice = type({
	time: "string",
	mid: {
		o: "number",
		c: "number",
		h: "number",
		l: "number"
	}
})
