import { getCookie, setCookie, deleteCookie } from "cookies-next"
import { createContext, PropsWithChildren, useEffect, useState } from "react"

import { FidorUser } from "@/@types/fidor"
import { useGetCurrentUserQuery } from "@/api/users"

const AuthContext = createContext<{
	user: typeof FidorUser.infer | null
	token: string | null
	setToken: (token: string | null) => void
}>({
	user: null,
	token: null,
	setToken: () => {}
})

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
	const [token, setToken] = useState((getCookie("token") ?? null) as string | null)

	const { data: user, error: userError } = useGetCurrentUserQuery(
		{ token: token ?? "-" },
		{ skip: !token }
	)

	useEffect(() => {
		if (token && userError) {
			deleteCookie("token")
			setToken(null)
		}
	}, [token, userError])

	const setTokenAndLocalStorage = (token: string | null) => {
		if (token) {
			setCookie("token", token)
		} else {
			deleteCookie("token")
		}

		setToken(token)
	}

	return (
		<AuthContext.Provider
			value={{
				user: token ? user ?? null : null,
				token,
				setToken: setTokenAndLocalStorage
			}}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthContext
