import { type } from "arktype"

export type FXEmpireEvent = typeof FXEmpireEvent.infer
export const FXEmpireEvent = type({
	actual: "string|null",
	allDay: "boolean",
	category: "string",
	color: "string",
	country: "string",
	date: "string",
	forecast: "string",
	hasHistory: "boolean",
	id: "number",
	impact: "number",
	isUpcoming: "boolean",
	name: "string",
	previous: "string",
	reference: "string",
	revised: "string",
	symbol: "string",
	time: "string"
})
