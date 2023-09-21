import { AxiosError } from "axios"
import { PropsWithChildren, useContext, useEffect, useState } from "react"
import { TypedUseSelectorHook, useSelector } from "react-redux"

import { AppShell, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconX } from "@tabler/icons-react"

import NavigatorContext from "@/contexts/NavigatorContext"
import { RootState } from "@/store"

import Header from "./Header"
import Navbar from "./Navbar"

export default function Shell(props: PropsWithChildren) {
	const { isBelowXs } = useContext(NavigatorContext)

	const queries = (useSelector as TypedUseSelectorHook<RootState>)(state => state.api.queries)

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
								{error.config?.method?.toUpperCase()} {error.config?.url}
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
	)
}
