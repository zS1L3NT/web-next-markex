import { useRouter } from "next/router"

import { SessionUser } from "@/@types/iron-session"

export const useAuthUser = () => {
	const router = useRouter() as any

	return (router.components?.[router.asPath]?.props?.pageProps?.user ??
		null) as SessionUser | null
}

export default useAuthUser
