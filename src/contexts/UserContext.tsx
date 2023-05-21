import { createContext } from "react"

import { SessionUser } from "@/@types/iron-session"

const UserContext = createContext(null as SessionUser | null)

export default UserContext
