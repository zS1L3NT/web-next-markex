import { PropsWithChildren, useState } from "react"

import { SessionUser } from "@/@types/iron-session"
import UserContext from "@/contexts/UserContext"
import { AppShell } from "@mantine/core"

import Header from "./Header"
import Navbar from "./Navbar"

export default function Shell({
	user: user_,
	children
}: PropsWithChildren<{ user: SessionUser | null }>) {
	const [user, setUser] = useState(user_)

	return (
		<UserContext.Provider value={{ user, setUser }}>
			<AppShell
				sx={{
					background: "rgb(20, 21, 23)",
					"& .mantine-AppShell-main": {
						width: "100%"
					}
				}}
				navbar={<Navbar />}
				header={<Header />}
				layout="alt">
				{children}
			</AppShell>
		</UserContext.Provider>
	)
}
