import { useRouter } from "next/router"
import { signIn, signOut, useSession } from "next-auth/react"
import {
	Dispatch,
	ForwardedRef,
	forwardRef,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"

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
import { IconArrowLeft, IconLogin, IconLogout, IconMenu2, IconSearch } from "@tabler/icons-react"

import { AlpacaSymbol } from "@/@types/alpaca"
import { useGetAlpacaSymbolsQuery } from "@/api/symbols"
import { CURRENCY, CURRENCY_NAMES, CURRENCY_PAIRS } from "@/constants"
import MediaQueryContext from "@/contexts/MediaQueryContext"

import Navbar from "./Navbar"

const getResults = (symbols: AlpacaSymbol[] | undefined) => {
	return [
		...(symbols ?? []).filter(x => x.tradable && x.exchange === "NASDAQ"),
		...CURRENCY_PAIRS.map(cp => cp.replace("_", " / ")),
	]
		.map(item => ({
			group: typeof item !== "string" ? "Stocks" : "Currency Pairs",
			label: typeof item !== "string" ? item.symbol : item,
			description:
				typeof item !== "string"
					? item.name
					: `${CURRENCY_NAMES[item.split(" / ")[0] as CURRENCY]} / ${
							CURRENCY_NAMES[item.split(" / ")[1] as CURRENCY]
					  }`,
			value:
				typeof item !== "string"
					? `/stocks/${item.symbol}`
					: `/currency-pairs/${item.toLowerCase().replace(" / ", "-")}`,
		}))
		.sort((a, b) => a.label.localeCompare(b.label))
}

const SelectItem = forwardRef(function SelectItem(
	{ description, label, ...others }: { label: string; description: string },
	ref: ForwardedRef<HTMLDivElement>,
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

function SearchButtonBar({
	symbols,
	isSearching,
	setIsSearching,
}: {
	symbols: AlpacaSymbol[] | undefined
	isSearching: boolean
	setIsSearching: Dispatch<SetStateAction<boolean>>
}) {
	const theme = useMantineTheme()
	const router = useRouter()

	const [isFullyOpened, setIsFullyOpened] = useState(false)
	const ref = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isSearching) {
			setTimeout(() => {
				setIsFullyOpened(true)
			}, 250)
		} else {
			setIsFullyOpened(false)
		}
	}, [isSearching])

	useEffect(() => {
		if (isFullyOpened && ref.current) {
			ref.current.focus()
		}
	}, [isFullyOpened, ref])

	return (
		<Box
			style={{
				width: isSearching ? "100%" : 34,
				height: isSearching ? 36 : 34,
				marginLeft: "auto",
				position: "relative",
				borderRadius: "0.25rem",
				backgroundColor: isSearching ? theme.colors.dark[5] : "rgba(52, 58, 64, 0.2)",
			}}>
			<Box
				style={{
					width: 34,
					height: 34,
					position: "absolute",
					top: "50%",
					left: isSearching ? "0" : "50%",
					transform: isSearching ? "translateY(-50%)" : "translate(-50%, -50%)",
				}}
				onClick={() => setIsSearching(true)}>
				<Box
					style={{
						width: "1.25rem",
						height: "1.25rem",
						margin: isSearching ? "7px 8px" : "7px",
						position: "absolute",
					}}>
					<IconArrowLeft
						size="1.25rem"
						color="#909296"
						style={{
							position: "absolute",
							opacity: isSearching ? 1 : 0,
						}}
					/>
					<IconSearch
						size="1.25rem"
						style={{
							position: "absolute",
							opacity: isSearching ? 0 : 1,
						}}
					/>
				</Box>
			</Box>
			{isSearching && (
				<Select
					ref={ref}
					sx={{
						"*": { transition: "initial" },
						"& input": { border: "none" },
						"& .mantine-Select-dropdown > * > *": {
							overflowX: "hidden !important" as "hidden",
						},
					}}
					dropdownComponent="div"
					style={{ opacity: isFullyOpened ? 1 : 0 }}
					variant="filled"
					size="sm"
					icon={
						<IconArrowLeft
							size="1.25rem"
							style={{ pointerEvents: "all" }}
							onClick={() => setIsSearching(false)}
						/>
					}
					searchable
					nothingFound="No instrument found"
					placeholder="Search for a instrument"
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
					data={getResults(symbols)}
					onChange={e => {
						if (e) {
							router.push(e)
							setIsSearching(false)
						}
					}}
					onBlur={() => setIsSearching(false)}
				/>
			)}
		</Box>
	)
}

export default function Header({ bookmarks }: { bookmarks: string[] | undefined }) {
	const { data: session } = useSession()
	const { isBelowXs, isBelowSm } = useContext(MediaQueryContext)
	const router = useRouter()

	const { data: symbols } = useGetAlpacaSymbolsQuery()

	const [isOpened, setIsOpened] = useState(false)
	const [isSearching, setIsSearching] = useState(false)

	useEffect(() => {
		if (!isBelowXs) {
			setIsOpened(false)
		}
	}, [isBelowXs, setIsOpened])

	return (
		<MantineHeader
			sx={{
				transition: isBelowSm ? undefined : "left 0.5s ease",
				left: isBelowXs ? 0 : undefined,
			}}
			height={57}>
			<Flex
				h="100%"
				align="center"
				sx={{ "*": { transition: "all 0.25s ease" } }}>
				{isBelowXs ? (
					<>
						<ActionIcon
							ml={isSearching ? "-28px" : "md"}
							mr="xs"
							onClick={() => setIsOpened(true)}>
							<IconMenu2 />
						</ActionIcon>
						<SearchButtonBar
							symbols={symbols}
							isSearching={isSearching}
							setIsSearching={setIsSearching}
						/>
					</>
				) : (
					<Box sx={{ flex: 1 }}>
						<Select
							sx={{
								width: "60%",
								margin: "auto",
								"*": { transition: "initial" },
								"& input": { border: "none" },
							}}
							variant="filled"
							icon={<IconSearch size={20} />}
							searchable
							nothingFound="No instrument found"
							placeholder="Search for a instrument"
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
							data={getResults(symbols)}
							onChange={e => {
								if (e) {
									router.push(e)
								}
							}}
						/>
					</Box>
				)}

				{session ? (
					isBelowXs ? (
						<ActionIcon
							variant="light"
							size="lg"
							ml="xs"
							mr={isSearching ? "-34px" : "md"}
							onClick={() => signOut()}>
							<IconLogout size="1.25rem" />
						</ActionIcon>
					) : (
						<Button
							variant="light"
							color="gray"
							size="sm"
							m={isBelowXs ? "sm" : "md"}
							onClick={() => signOut()}>
							Logout
						</Button>
					)
				) : isBelowXs ? (
					<ActionIcon
						variant="light"
						size="lg"
						ml="xs"
						mr={isSearching ? "-34px" : "md"}
						onClick={() => signIn()}>
						<IconLogin size="1.25rem" />
					</ActionIcon>
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
					sx={{ "*": { transition: "initial" } }}
					opened={isOpened}
					onClose={() => setIsOpened(false)}
					withCloseButton={false}
					size="100%">
					<Navbar
						bookmarks={bookmarks}
						drawer={{
							isOpened,
							close: () => setIsOpened(false),
						}}
					/>
				</Drawer>
			</Flex>
		</MantineHeader>
	)
}
