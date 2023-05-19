import { deleteCookie } from "cookies-next"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useContext, useEffect } from "react"

import AuthContext from "@/contexts/AuthContext"

export default function Logout() {
	const { setToken } = useContext(AuthContext)
	const router = useRouter()

	useEffect(() => {
		setToken(null)
		router.push("/")
	}, [])

	return <></>
}

export const getServerSideProps: GetServerSideProps = async context => {
	deleteCookie("token", context)

	return {
		props: {}
	}
}
