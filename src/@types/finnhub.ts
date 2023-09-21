import { type } from "arktype"

export type FinnhubMetric = typeof FinnhubMetric.infer
export const FinnhubMetric = type({
	"marketCapitalization?": "number|null", // Market cap
	"beta?": "number|null", // Beta
	"10DayAverageTradingVolume?": "number|null", // Avg vol (10 days)
	"3MonthAverageTradingVolume?": "number|null", // Avg vol (3 month)
	"52WeekHigh?": "number|null", // 52-week high
	"52WeekLow?": "number|null", // 52-week low
	"peTTM?": "number|null", // PE ratio (TTM)
	"epsTTM?": "number|null", // EPS (TTM)
	"roaTTM?": "number|null", // ROA (TTM)
	"roeTTM?": "number|null", // ROE (TTM)
})

export type FinnhubTrend = typeof FinnhubTrend.infer
export const FinnhubTrend = type({
	buy: "number",
	hold: "number",
	period: "string",
	sell: "number",
	strongBuy: "number",
	strongSell: "number",
	symbol: "string",
})

export type FinnhubEarnings = typeof FinnhubEarnings.infer
export const FinnhubEarnings = type({
	date: "string", // format YYYY-MM-DD
	epsActual: "number|null",
	epsEstimate: "number|null",
	hour: "'amc'|'bmo'|'dmh'|''", // after market close, before market open, during market hours
	quarter: "number", // earnings quarter
	revenueActual: "number|null",
	revenueEstimate: "number|null",
	symbol: "string",
	year: "number", // earnings year
})
