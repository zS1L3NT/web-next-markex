import { useRouter } from "next/router"
import { signIn, signOut, useSession } from "next-auth/react"
import { forwardRef } from "react"

import {
	ActionIcon,
	Box,
	Button,
	Drawer,
	Flex,
	Group,
	Header as MantineHeader,
	Select,
	Text,
	useMantineTheme,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { IconMenu2, IconSearch } from "@tabler/icons-react"

import { useGetAlpacaSymbolsQuery } from "@/api/symbols"
import { CURRENCY_PAIRS } from "@/constants"

import Navbar from "./Navbar"

export default function Header() {
	const { data: session } = useSession()
	const theme = useMantineTheme()
	const router = useRouter()

	const isBelowXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isBelowSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const { data: symbols } = useGetAlpacaSymbolsQuery()

	const [opened, { toggle, close }] = useDisclosure(false)

	const getResults = () => {
		const currencies = CURRENCY_PAIRS.map(cp => cp.replace("_", " / "))
		const results = [
			...(symbols ?? []).filter(x => x.tradable && x.exchange === "NASDAQ"),
			...currencies,
		]
		return results
			.map(item => {
				return {
					group: typeof item !== "string" ? "Stocks" : "Currency Pairs",
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

	const SelectItem = forwardRef<HTMLDivElement, ItemProps>(function SelectItem(
		{ description, label, ...others }: ItemProps,
		ref,
	) {
		return (
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
		)
	})

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
							placeholder="Search for a instrument"
							icon={<IconSearch size={20} />}
							searchable
							nothingFound="No instrument found"
							itemComponent={SelectItem}
							limit={10}
							filter={(value, item) => {
								const regex = /[/\s]/g
								return item.group === "Currency Pairs"
									? item
											.label!.replace(regex, "")
											.toLowerCase()
											.includes(value.replace(regex, "").toLowerCase())
									: item.label!.toLowerCase().includes(value.toLowerCase())
							}}
							data={getResults()}
							onChange={e => {
								if (e) {
									router.push(e)
								}
							}}
						/>
					</Box>
				)}

				{session ? (
					<Button
						variant="light"
						color="gray"
						size="sm"
						m={isBelowXs ? "sm" : "md"}
						onClick={() => signOut()}>
						Logout
					</Button>
				) : (
					<Button
						variant="light"
						color="gray"
						size="sm"
						m={isBelowXs ? "sm" : "md"}
						onClick={() => signIn()}>
						Sign in with Google
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
