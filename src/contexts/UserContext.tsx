import { createContext } from "react"

import { User } from "@/@types/types"

const UserContext = createContext({
	user: null as User | null,
	setUser: ((user: User) => {}) as (user: User) => void
})

export default UserContext
