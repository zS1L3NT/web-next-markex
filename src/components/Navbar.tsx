import Link from "next/link"
import { useContext } from "react"

import { CURRENCY, CURRENCY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import UserContext from "@/contexts/UserContext"
import {
	Button, Center, createStyles, Divider, Navbar as MantineNavbar, ScrollArea, Stack, Text,
	useMantineTheme
} from "@mantine/core"
import {
	IconArrowsHorizontal, IconCurrency, IconDashboard, IconList, IconWallet
} from "@tabler/icons-react"

const useStyles = createStyles(() => ({
	button: {
		width: "100%",
		"& > .mantine-Button-inner": {
			justifyContent: "start"
		}
	}
}))

function CurrencyPair({ currencyPair }: { currencyPair: CURRENCY_PAIR }) {
	const [currencyA, currencyB] = currencyPair.split("_") as [CURRENCY, CURRENCY]

	return (
		<Button
			sx={{
				width: "100%",
				"& .mantine-Button-label": {
					width: "100%",
					justifyContent: "space-between"
				}
			}}
			variant="subtle"
			color="gray"
			size="md"
			px="md"
			component={Link}
			href={"/currency-pairs/" + currencyPair}>
			<Stack
				sx={{ flexDirection: "row", alignItems: "center" }}
				spacing="0.5rem">
				<Text fz="1.5rem">{CURRENCY_FLAGS[currencyA]}</Text>
				{currencyA}
			</Stack>
			<IconArrowsHorizontal />
			<Stack
				sx={{ flexDirection: "row", alignItems: "center" }}
				spacing="0.5rem">
				{currencyB}
				<Text fz="1.5rem">{CURRENCY_FLAGS[currencyB]}</Text>
			</Stack>
		</Button>
	)
}

export default function Navbar() {
	const theme = useMantineTheme()
	const { user } = useContext(UserContext)

	const { classes } = useStyles()

	return (
		<MantineNavbar width={{ base: 280 }}>
			<MantineNavbar.Section p="md">
				<Center
					sx={{
						width: "fit-content",
						margin: "auto",
						alignItems: "center",
						color: "white",
						textDecoration: "none"
					}}
					component={Link}
					href="/">
					<IconCurrency size="1.5rem" />
					<Text
						ml="sm"
						fz="1.5rem"
						weight={600}>
						MARKEX
					</Text>
				</Center>
			</MantineNavbar.Section>

			<MantineNavbar.Section
				sx={{
					borderTop: `1px solid ${theme.colors.dark[5]}`,
					borderBottom: `1px solid ${theme.colors.dark[5]}`
				}}
				component={ScrollArea}
				p="md"
				grow>
				<Stack spacing="0.5rem">
					<Button
						className={classes.button}
						variant="subtle"
						color="gray"
						size="md"
						leftIcon={<IconDashboard size={20} />}
						component={Link}
						href="/dashboard">
						Dashboard
					</Button>

					<Button
						className={classes.button}
						variant="subtle"
						color="gray"
						size="md"
						leftIcon={<IconList size={20} />}
						component={Link}
						href="/currency-pairs">
						Currency Pairs
					</Button>

					{user && (
						<Button
							className={classes.button}
							variant="subtle"
							color="gray"
							size="md"
							leftIcon={<IconWallet size={20} />}
							component={Link}
							href="/wallet">
							My Wallet
						</Button>
					)}

					<Divider
						my="0.5rem"
						color={theme.colors.dark[5]}
					/>

					{user ? (
						user.app.bookmarks.length ? (
							user.app.bookmarks.map(c => (
								<CurrencyPair
									key={c}
									currencyPair={c}
								/>
							))
						) : (
							<Text
								align="center"
								fz="xs"
								color={theme.colors.gray[7]}>
								No bookmarks
							</Text>
						)
					) : (
						<>
							{CURRENCY_PAIRS.slice(0, 8).map(c => (
								<CurrencyPair
									key={c}
									currencyPair={c}
								/>
							))}
							<Text
								align="center"
								fz="xs"
								color={theme.colors.gray[7]}>
								Sign in to customise bookmarked
								<br />
								currency pairs
							</Text>
						</>
					)}
				</Stack>
			</MantineNavbar.Section>
		</MantineNavbar>
	)
}
