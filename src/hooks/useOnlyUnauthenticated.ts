import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

import AuthContext from "@/contexts/AuthContext"

const useOnlyUnauthenticated = (redirect = "/dashboard") => {
	const { token } = useContext(AuthContext)
	const router = useRouter()

	useEffect(() => {
		if (token !== null) {
			router.push(redirect)
		}
	}, [token])
}

export default useOnlyUnauthenticated
