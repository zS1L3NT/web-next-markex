import { createContext } from "react"

import { SessionUser } from "@/@types/iron-session"

const UserContext = createContext({
	user: null as SessionUser | null,
	setUser: ((user: SessionUser) => {}) as (user: SessionUser) => void
})

export default UserContext
