import Link from "next/link"
import { useRouter } from "next/router"
import { forwardRef,useContext } from "react"

import {
	ActionIcon,
	Avatar,
	Box,
	Button,
	Drawer,
	Flex,
	Group,
	Header as MantineHeader,
	Menu,
	Select,
	Text,
	useMantineTheme,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { IconLogout, IconMenu2, IconSearch, IconUser } from "@tabler/icons-react"

import { useGetAlpacaSymbolsQuery } from "@/api/symbols"
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

	const { data: symbols } = useGetAlpacaSymbolsQuery()

	const [opened, { toggle, close }] = useDisclosure(false)

	const getResults = () => {
		const currencies = CURRENCY_PAIRS.map(cp => cp.replace("_", " / "))
		const results = [...(symbols ?? []).filter(x => x.tradable), ...currencies]
		return results
			.map(item => {
				return {
					label: typeof item !== "string" ? item.symbol : item,
					description: typeof item !== "string" ? item.name : undefined,
					value:
						typeof item !== "string"
							? `/stocks/${item.symbol}`
							: `/currency-pairs/${item.toLowerCase().replace(" / ", "-")}`,
				}
			})
			.sort((a, b) => {
				return a.label.localeCompare(b.label)
			})
	}

	interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
		label: string
		description: string | undefined
	}

	const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
		({ description, label, ...others }: ItemProps, ref) => (
			<div
				ref={ref}
				{...others}>
				<Group noWrap>
					<div>
						<Text size="sm">{label}</Text>
						<Text
							size="xs"
							opacity={0.65}>
							{description}
						</Text>
					</div>
				</Group>
			</div>
		),
	)

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
							itemComponent={SelectItem}
							limit={10}
							data={getResults()}
							onChange={e => {
								if (e) {
									router.push(e)
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
