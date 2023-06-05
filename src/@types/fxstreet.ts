import { arrayOf, type } from "arktype"

export type FXStreetNews = typeof FXStreetNews.infer
export const FXStreetNews = type({
	AuthorImageUrl: "string",
	AuthorName: "string",
	AuthorUrl: "string",
	BusinessId: "string",
	Category: "string",
	CompanyName: "string",
	CompanyUrl: "string",
	CultureName: "string",
	FeedId: "string",
	FullUrl: "string",
	ImageUrl: "string",
	IsFuture: "number",
	PublicationTime: "number",
	Summary: "string",
	Tags: arrayOf("string"),
	Title: "string",
	VideoDuration: "number|null",
	objectID: "string",
})
