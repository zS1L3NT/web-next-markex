import { AxiosError } from "axios"
import { PropsWithChildren, useEffect, useState } from "react"
import { TypedUseSelectorHook, useSelector } from "react-redux"

import { AppShell, Text, useMantineTheme } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconX } from "@tabler/icons-react"

import { User } from "@/@types/types"
import UserContext from "@/contexts/UserContext"
import { RootState } from "@/store"

import Header from "./Header"
import Navbar from "./Navbar"

export default function Shell(props: PropsWithChildren<{ user: User | null }>) {
	const theme = useMantineTheme()

	const queries = (useSelector as TypedUseSelectorHook<RootState>)(state => state.api.queries)

	const isBelowXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)

	const [user, setUser] = useState(props.user)
	const [notified, setNotified] = useState<string[]>([])

	useEffect(() => {
		for (const [, data] of Object.entries(queries)) {
			if (
				data &&
				typeof data.error === "object" &&
				data.requestId &&
				!notified.includes(data.requestId)
			) {
				const error = data.error as AxiosError

				setNotified([...notified, data.requestId])
				notifications.show({
					id: data.requestId,
					withCloseButton: true,
					autoClose: 10000,
					title: `${error.name}: ${error.code}`,
					message: (
						<>
							<Text
								sx={{ wordBreak: "break-all" }}
								weight={700}
								lineClamp={3}>
								{error.config?.url === "/api/proxy"
									? JSON.parse(error.config.data).method
									: error.config?.method?.toUpperCase()}{" "}
								{error.config?.url === "/api/proxy"
									? JSON.parse(error.config.data).url
									: error.config?.url}
							</Text>
							{error.message}
						</>
					),
					color: "red",
					icon: <IconX />,
				})
			}
		}
	}, [queries, notified])

	return (
		<UserContext.Provider value={{ user, setUser }}>
			<AppShell
				sx={{
					background: "rgb(20, 21, 23)",
					"& .mantine-AppShell-main": {
						width: "100%",
						overflow: "hidden",
					},
				}}
				navbar={isBelowXs ? undefined : <Navbar />}
				header={<Header />}
				layout="alt">
				{props.children}
			</AppShell>
		</UserContext.Provider>
	)
}
