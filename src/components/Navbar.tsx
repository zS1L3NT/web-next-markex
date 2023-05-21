import Link from "next/link"

import { COUNTRY_FLAGS, CURRENCY_PAIRS } from "@/constants"
import {
	Button, Center, createStyles, Divider, Loader, Navbar as MantineNavbar, ScrollArea, Stack, Text,
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

function CurrencyPair({ currencyPair }: { currencyPair: string }) {
	const [countryA, countryB] = currencyPair.split("_") as [
		keyof typeof COUNTRY_FLAGS,
		keyof typeof COUNTRY_FLAGS
	]

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
				<Text fz="1.5rem">{COUNTRY_FLAGS[countryA]}</Text>
				{countryA}
			</Stack>
			<IconArrowsHorizontal />
			<Stack
				sx={{ flexDirection: "row", alignItems: "center" }}
				spacing="0.5rem">
				{countryB}
				<Text fz="1.5rem">{COUNTRY_FLAGS[countryB]}</Text>
			</Stack>
		</Button>
	)
}

export default function Navbar() {
	const theme = useMantineTheme()
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
					{null && (
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
					)}

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

					{null && (
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

					{null ? (
						null ? (
							CURRENCY_PAIRS.slice(0, 8).map(c => (
								<CurrencyPair
									key={c}
									currencyPair={c}
								/>
							))
						) : (
							<Loader
								sx={{ margin: "auto", marginTop: "0.5rem" }}
								size={20}
								color="gray"
							/>
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
