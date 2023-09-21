import api from "@/api/api"

const bookmarks = api.injectEndpoints({
	endpoints: builder => ({
		getBookmarks: builder.query<string[], void>({
			query: () => ({
				url: "/api/bookmarks",
				method: "GET",
				auth: true,
			}),
			providesTags: ["Bookmarks"],
		}),
		updateBookmarks: builder.mutation<void, string[]>({
			query: bookmarks => ({
				url: "/api/bookmarks",
				method: "PUT",
				body: bookmarks,
				auth: true,
			}),
			invalidatesTags: ["Bookmarks"],
		}),
	}),
})

export const { useGetBookmarksQuery, useLazyGetBookmarksQuery, useUpdateBookmarksMutation } =
	bookmarks
