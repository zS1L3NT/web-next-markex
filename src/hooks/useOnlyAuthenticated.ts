import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

import AuthContext from "@/contexts/AuthContext"
import useAppDispatch from "@/hooks/useAppDispatch"
import { setError } from "@/slices/ErrorSlice"

const useOnlyAuthenticated = () => {
	const { token, user } = useContext(AuthContext)
	const router = useRouter()

	const dispatch = useAppDispatch()

	useEffect(() => {
		if (token === null) {
			if (location.pathname !== "/") router.push("/")

			dispatch(
				setError({
					message: "You must be logged in to access this page."
				})
			)
		}
	}, [token])

	return {
		token: token ?? "",
		user
	}
}

export default useOnlyAuthenticated
