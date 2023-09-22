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
			onQueryStarted: async (bookmarks_, { dispatch, queryFulfilled }) => {
				const patchResult = dispatch(
					bookmarks.util.updateQueryData("getBookmarks", undefined, draft => {
						Object.assign(draft, bookmarks_)
					}),
				)

				try {
					await queryFulfilled
				} catch {
					patchResult.undo()
				}
			},
		}),
	}),
})

export const { useGetBookmarksQuery, useLazyGetBookmarksQuery, useUpdateBookmarksMutation } =
	bookmarks
