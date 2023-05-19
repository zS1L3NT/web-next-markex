import { COUNTRY_FLAGS, CURRENCIES } from "@/constants"
import {
	Button, createStyles, Divider, Navbar as MantineNavbar, ScrollArea, Stack, Text, useMantineTheme
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

function Currency({ currency }: { currency: string }) {
	const [currencyA, currencyB] = currency.split("_") as [string, string]

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
			px="md">
			<Stack
				sx={{ flexDirection: "row", alignItems: "center" }}
				spacing="0.5rem">
				<Text fz="1.5rem">{COUNTRY_FLAGS[currencyA]}</Text>
				{currencyA}
			</Stack>
			<IconArrowsHorizontal />
			<Stack
				sx={{ flexDirection: "row", alignItems: "center" }}
				spacing="0.5rem">
				{currencyB}
				<Text fz="1.5rem">{COUNTRY_FLAGS[currencyB]}</Text>
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
				<Stack
					sx={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						userSelect: "none"
					}}
					spacing="0.5rem">
					<IconCurrency size="1.5rem" />
					<Text
						mr="xs"
						fz="1.5rem"
						weight={600}>
						MARKEX
					</Text>
				</Stack>
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
						leftIcon={<IconDashboard />}>
						Live Dashboard
					</Button>

					<Button
						className={classes.button}
						variant="subtle"
						color="gray"
						size="md"
						leftIcon={<IconList />}>
						All Currency Pairs
					</Button>

					<Button
						className={classes.button}
						variant="subtle"
						color="gray"
						size="md"
						leftIcon={<IconWallet />}>
						My Assets
					</Button>

					<Divider
						my="0.5rem"
						color={theme.colors.dark[5]}
					/>

					{CURRENCIES.slice(0, 8).map(c => (
						<Currency
							key={c}
							currency={c}
						/>
					))}
				</Stack>
			</MantineNavbar.Section>
		</MantineNavbar>
	)
}
