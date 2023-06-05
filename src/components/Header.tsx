import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"

import {
	ActionIcon,
	Avatar,
	Box,
	Button,
	Drawer,
	Flex,
	Header as MantineHeader,
	Menu,
	Select,
	useMantineTheme,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { IconLogout, IconMenu2, IconSearch, IconUser } from "@tabler/icons-react"

import { useGetFidorAvailableQuery } from "@/api/users"
import { CURRENCY_PAIRS } from "@/constants"
import UserContext from "@/contexts/UserContext"

import Navbar from "./Navbar"

export default function Header() {
	const theme = useMantineTheme()
	const { user } = useContext(UserContext)
	const router = useRouter()

	const isBelowXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isBelowSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const { error: down, isLoading: downIsLoading } = useGetFidorAvailableQuery(undefined, {
		pollingInterval: 60_000,
	})

	const [opened, { toggle, close }] = useDisclosure(false)

	return (
		<MantineHeader
			sx={{ transition: isBelowSm ? undefined : "left 0.5s ease" }}
			height={57}>
			<Flex
				h="100%"
				align="center"
				justify={isBelowXs ? "space-between" : "initial"}>
				{isBelowXs ? (
					<ActionIcon
						m="sm"
						onClick={toggle}>
						<IconMenu2 />
					</ActionIcon>
				) : (
					<Box sx={{ flex: 1 }}>
						<Select
							sx={{ width: "60%", margin: "auto" }}
							placeholder="Search for a currency pair"
							icon={<IconSearch size={20} />}
							searchable
							nothingFound="No currency pairs found"
							data={CURRENCY_PAIRS.map(cp => cp.replace("_", " / "))}
							onChange={e => {
								if (e !== null) {
									router.push(
										"/currency-pairs/" + e.toLowerCase().replace(" / ", "-"),
									)
								}
							}}
						/>
					</Box>
				)}

				{user ? (
					<Menu width={200}>
						<Menu.Target>
							<Avatar
								sx={{ cursor: "pointer" }}
								size="md"
								m={isBelowXs ? "sm" : "md"}
								src={null}
							/>
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Item
								icon={<IconUser size={14} />}
								component={Link}
								href="/profile">
								Profile
							</Menu.Item>
							<Menu.Item
								icon={<IconLogout size={14} />}
								component={Link}
								href="/logout">
								Logout
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				) : (
					<Button
						variant="light"
						color="gray"
						size="sm"
						m={isBelowXs ? "sm" : "md"}
						component={Link}
						href="/login"
						loading={downIsLoading}
						disabled={!!down}>
						Sign in with Fidor
					</Button>
				)}

				<Drawer
					opened={opened}
					onClose={close}
					withCloseButton={false}
					size="100%">
					<Navbar
						isDrawer
						closeDrawer={close}
					/>
				</Drawer>
			</Flex>
		</MantineHeader>
	)
}
