import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useContext, useEffect } from "react"

import { CURRENCY, CURRENCY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import NavigatorContext from "@/contexts/NavigatorContext"
import UserContext from "@/contexts/UserContext"
import {
	ActionIcon, Box, Button, createStyles, Divider, Navbar as MantineNavbar, ScrollArea, Stack,
	Text, Title, useMantineTheme
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
	IconArrowLeft, IconArrowsHorizontal, IconCurrency, IconDashboard, IconList, IconWallet
} from "@tabler/icons-react"

const useStyles = createStyles((theme, { opened }: { opened: boolean }) => ({
	button: {
		width: opened ? "100%" : "fit-content",
		paddingLeft: 12,
		paddingRight: 12,
		"& .mantine-Button-inner": {
			justifyContent: "start"
		},
		"& .mantine-Button-leftIcon": {
			marginRight: 0
		}
	}
}))

function CurrencyPair({ currencyPair, opened }: { currencyPair: CURRENCY_PAIR; opened: boolean }) {
	const [base, quote] = currencyPair.split("_") as [CURRENCY, CURRENCY]

	return (
		<Button
			sx={{
				width: opened ? "100%" : 46,
				paddingLeft: opened ? 12 : 6,
				paddingRight: opened ? 12 : 6,
				"& .mantine-Button-label": {
					width: "100%",
					position: "relative",
					"& *": {
						position: "absolute",
						transition: "all 0.5s ease"
					},
					"& > .mantine-Text-root": {
						lineHeight: 1
					}
				},
				transition: "width 0.5s ease"
			}}
			variant="subtle"
			color="gray"
			size="md"
			component={Link}
			href={"/currency-pairs/" + currencyPair.toLowerCase().replace("_", "-")}>
			<Text
				left={opened ? 12 : -4}
				top={opened ? "initial" : 0}
				fz="1.5rem">
				{CURRENCY_FLAGS[base]}
			</Text>
			<AnimatePresence>
				{opened && (
					<motion.div
						style={{ width: "100%" }}
						initial={{ opacity: 1 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<Text
							sx={{ transform: "translateY(-50%)" }}
							left={opened ? 44 : 0}
							top="50%">
							{base}
						</Text>
						<IconArrowsHorizontal
							style={{
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)"
							}}
						/>
						<Text
							sx={{ transform: "translateY(-50%)" }}
							right={opened ? 44 : 0}
							top="50%">
							{quote}
						</Text>
					</motion.div>
				)}
			</AnimatePresence>
			<Text
				right={opened ? 12 : -4}
				bottom={opened ? "initial" : 0}
				fz="1.5rem">
				{CURRENCY_FLAGS[quote]}
			</Text>
		</Button>
	)
}

export default function Navbar() {
	const theme = useMantineTheme()
	const { user } = useContext(UserContext)
	const { opened: opened_, setOpened } = useContext(NavigatorContext)
	const opened = opened_ || opened_ === undefined

	const isAboveMd = useMediaQuery(`(min-width: ${theme.breakpoints.md})`)
	const { classes } = useStyles({ opened })

	useEffect(() => {
		setOpened(isAboveMd)
	}, [isAboveMd])

	return (
		<MantineNavbar
			width={{ base: opened ? 280 : 64 }}
			sx={{ transition: "width 0.5s ease" }}>
			<MantineNavbar.Section
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "0.5rem",
					transition: "padding 0.5s ease"
				}}
				px={16}
				py={8}>
				<Box
					w={20}
					h={20}
					my={10}
					mx={6}>
					<IconCurrency size={20} />
				</Box>
				<AnimatePresence>
					{opened && (
						<motion.div
							initial={{ opacity: 1 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}>
							<Title order={4}>Markex</Title>
						</motion.div>
					)}
				</AnimatePresence>
			</MantineNavbar.Section>

			<MantineNavbar.Section
				sx={{
					borderTop: `1px solid ${theme.colors.dark[5]}`,
					borderBottom: `1px solid ${theme.colors.dark[5]}`
				}}
				component={ScrollArea}
				p="0.5rem"
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
						<AnimatePresence>
							{opened && (
								<motion.div
									style={{ marginLeft: 10 }}
									initial={{ opacity: 1 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}>
									Dashboard
								</motion.div>
							)}
						</AnimatePresence>
					</Button>

					<Button
						className={classes.button}
						variant="subtle"
						color="gray"
						size="md"
						leftIcon={<IconList size={20} />}
						component={Link}
						href="/currency-pairs">
						<AnimatePresence>
							{opened && (
								<motion.div
									style={{ marginLeft: 10 }}
									initial={{ opacity: 1 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}>
									Currency Pairs
								</motion.div>
							)}
						</AnimatePresence>
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
							<AnimatePresence>
								{opened && (
									<motion.div
										style={{ marginLeft: 10 }}
										initial={{ opacity: 1 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}>
										My Wallet
									</motion.div>
								)}
							</AnimatePresence>
						</Button>
					)}

					<Divider
						my="0.25rem"
						color={theme.colors.dark[5]}
					/>

					{user ? (
						user.app.bookmarks.length ? (
							user.app.bookmarks.map(c => (
								<CurrencyPair
									key={c}
									currencyPair={c}
									opened={opened}
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
									opened={opened}
								/>
							))}
							<AnimatePresence>
								{opened && (
									<motion.div
										initial={{ opacity: 1 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}>
										<Text
											align="center"
											fz="xs"
											c="dimmed">
											Sign in to customise bookmarked
											<br />
											currency pairs
										</Text>
									</motion.div>
								)}
							</AnimatePresence>
						</>
					)}
				</Stack>
			</MantineNavbar.Section>

			{isAboveMd && (
				<MantineNavbar.Section
					px="md"
					py="sm">
					<ActionIcon
						ml="auto"
						mr={opened ? 0 : 2}
						onClick={() => setOpened(!opened)}>
						<IconArrowLeft
							size={20}
							style={{
								transform: `rotate(${Number(!opened) * 180}deg)`,
								transition: "transform 0.5s ease"
							}}
						/>
					</ActionIcon>
				</MantineNavbar.Section>
			)}
		</MantineNavbar>
	)
}
