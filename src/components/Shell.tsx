import { PropsWithChildren } from "react"

import { SessionUser } from "@/@types/iron-session"
import UserContext from "@/contexts/UserContext"
import { AppShell } from "@mantine/core"

import Header from "./Header"
import Navbar from "./Navbar"

export default function Shell({ user, children }: PropsWithChildren<{ user: SessionUser | null }>) {
	return (
		<UserContext.Provider value={user}>
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
