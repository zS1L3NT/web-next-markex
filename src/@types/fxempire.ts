import { arrayOf, type } from "arktype"

export type FXEmpireEvent = typeof FXEmpireEvent.infer
export const FXEmpireEvent = type({
	"actual?": "string|null",
	allDay: "boolean",
	"category?": "string",
	"color?": "string",
	country: "string",
	date: "string",
	"forecast?": "string",
	hasHistory: "boolean",
	id: "number",
	impact: "number",
	isUpcoming: "boolean",
	name: "string",
	"previous?": "string",
	"reference?": "string",
	"revised?": "string",
	"symbol?": "string",
	"time?": "string",
})

export type FXEmpireHistory = typeof FXEmpireHistory.infer
export const FXEmpireHistory = type({
	summary: {
		category: {
			slug: "string",
			name: "string",
		},
		highest: {
			value: "string",
			time: "string",
		},
		lowest: {
			value: "string",
			time: "string",
		},
		last: {
			value: "string",
			time: "string",
		},
		previous: {
			value: "string",
			time: "string",
		},
		next: {
			time: "string|null",
		},
		change: {
			value: "string",
			time: "string",
		},
		range: "string",
		frequency: "string",
		unit: "string",
	},
	history: arrayOf(
		type({
			formattedDate: "string",
			close: "number",
			formattedClose: "string",
			timestamp: "number",
		}),
	),
})

export type FXEmpireSearchResult = typeof FXEmpireSearchResult.infer
export const FXEmpireSearchResult = type({
	slug: "string",
	title: "string",
	subtitle: "string",
	category: "string",
	"exchange?": "string",
	hash: "string",
	"price?": {
		last: "number",
		percentChange: "number",
	},
})
