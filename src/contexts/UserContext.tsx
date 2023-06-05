import { createContext } from "react"

import { User } from "@/@types/types"

const UserContext = createContext({
	user: null as User | null,
	setUser: (() => {}) as (user: User) => void,
})

export default UserContext
