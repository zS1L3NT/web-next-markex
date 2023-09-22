import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useContext } from "react"

import {
	ActionIcon,
	Avatar,
	Box,
	Button,
	createStyles,
	Divider,
	Navbar as MantineNavbar,
	ScrollArea,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core"
import {
	IconArrowsHorizontal,
	IconDashboard,
	IconList,
	IconTicket,
	IconX,
} from "@tabler/icons-react"

import { CURRENCY, CURRENCY_FLAGS, CURRENCY_PAIR, CURRENCY_PAIRS } from "@/constants"
import MediaQueryContext from "@/contexts/MediaQueryContext"

const useStyles = createStyles(
	(theme, { isBelowXs, isAboveLg }: { isBelowXs: boolean; isAboveLg: boolean }) => ({
		button: {
			width: isBelowXs || isAboveLg ? "100%" : "fit-content",
			paddingLeft: 12,
			paddingRight: 12,
			"& .mantine-Button-inner": {
				justifyContent: "start",
			},
			"& .mantine-Button-leftIcon": {
				marginRight: 0,
			},
		},
	}),
)

function CurrencyPair({
	currencyPair,
	close,
	opened,
}: {
	currencyPair: CURRENCY_PAIR
	close: () => void
	opened: boolean
}) {
	const [base, quote] = currencyPair.split("_") as [CURRENCY, CURRENCY]

	return (
		<Button
			sx={{
				width: opened ? "100%" : 50,
				paddingLeft: opened ? 12 : 4,
				paddingRight: opened ? 12 : 4,
				"& .mantine-Button-label": {
					width: "100%",
					position: "relative",
					"& *": {
						position: "absolute",
						transition: "all 0.5s ease",
					},
					"& > .mantine-Text-root": {
						lineHeight: 1,
					},
				},
				transition: "width 0.5s ease",
			}}
			variant="subtle"
			color="gray"
			size="md"
			component={Link}
			href={"/currency-pairs/" + currencyPair.toLowerCase().replace("_", "-")}
			onClick={close}>
			<Image
				style={{
					left: opened ? 12 : 0,
					top: opened ? "initial" : 2,
				}}
				src={CURRENCY_FLAGS[base]}
				alt={base}
				height={18}
				width={24}
			/>
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
								transform: "translate(-50%, -50%)",
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
			<Image
				style={{
					right: opened ? 12 : 0,
					bottom: opened ? "initial" : 2,
				}}
				src={CURRENCY_FLAGS[quote]}
				alt={quote}
				height={18}
				width={24}
			/>
		</Button>
	)
}

function Symbol({ symbol, close, opened }: { symbol: string; close: () => void; opened: boolean }) {
	return (
		<Button
			sx={{
				width: opened ? "100%" : 50,
				paddingLeft: opened ? 12 : 4,
				paddingRight: opened ? 12 : 4,
				"& .mantine-Button-label": {
					width: "100%",
					position: "relative",
					"& *": {
						position: "absolute",
						transition: "all 0.5s ease",
					},
					"& > .mantine-Text-root": {
						lineHeight: 1,
					},
				},
				transition: "width 0.5s ease",
			}}
			variant="subtle"
			color="gray"
			size="md"
			component={Link}
			href={"/stocks/" + symbol}
			onClick={close}>
			<Avatar
				style={{
					left: opened ? 12 : 0,
					width: opened ? undefined : "100%",
					height: opened ? undefined : "100%",
				}}
				size={"sm"}
				color="blue"
				radius="md">
				{symbol.slice(0, 2)}
			</Avatar>
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
							{symbol}
						</Text>
					</motion.div>
				)}
			</AnimatePresence>
		</Button>
	)
}

export default function Navbar({
	bookmarks,
	drawer,
}: {
	bookmarks: string[] | undefined
	drawer?: {
		isOpened: boolean
		close: () => void
	}
}) {
	const { isBelowXs, isAboveLg } = useContext(MediaQueryContext)
	const theme = useMantineTheme()
	const { classes } = useStyles({ isBelowXs, isAboveLg })

	return (
		<MantineNavbar
			width={{ base: isBelowXs ? (drawer?.isOpened ? "100%" : 0) : isAboveLg ? 280 : 64 }}
			sx={{ transition: isBelowXs ? undefined : "width 0.5s ease" }}>
			<MantineNavbar.Section
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "0.5rem",
					transition: "padding 0.5s ease",
					color: theme.colors.gray[2],
					textDecoration: "none",
				}}
				px={16}
				py={8}
				component={Link}
				href="/"
				onClick={() => drawer?.close()}>
				<Box
					w={24}
					h={24}
					my={8}
					mx={4}>
					<Image
						src="/logo.png"
						alt="Logo"
						width={24}
						height={24}
						style={{ verticalAlign: "initial" }}
					/>
				</Box>
				<AnimatePresence>
					{(isBelowXs || isAboveLg) && (
						<motion.div
							initial={{ opacity: 1 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}>
							<Title order={4}>Markex</Title>
						</motion.div>
					)}
				</AnimatePresence>
				{drawer && (
					<ActionIcon
						size={16}
						ml="auto"
						onClick={() => drawer.close()}>
						<IconX />
					</ActionIcon>
				)}
			</MantineNavbar.Section>

			<MantineNavbar.Section
				sx={{
					borderTop: `1px solid ${theme.colors.dark[5]}`,
					borderBottom: `1px solid ${theme.colors.dark[5]}`,
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
						href="/dashboard"
						onClick={() => drawer?.close()}>
						<AnimatePresence>
							{(isBelowXs || isAboveLg) && (
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
						href="/currency-pairs"
						onClick={() => drawer?.close()}>
						<AnimatePresence>
							{(isBelowXs || isAboveLg) && (
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

					<Button
						className={classes.button}
						variant="subtle"
						color="gray"
						size="md"
						leftIcon={<IconTicket size={20} />}
						component={Link}
						href="/stocks"
						onClick={() => drawer?.close()}>
						<AnimatePresence>
							{(isBelowXs || isAboveLg) && (
								<motion.div
									style={{ marginLeft: 10 }}
									initial={{ opacity: 1 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}>
									Stocks
								</motion.div>
							)}
						</AnimatePresence>
					</Button>

					<Divider
						my="0.25rem"
						color={theme.colors.dark[5]}
					/>

					{bookmarks ? (
						bookmarks.length ? (
							bookmarks.map(i =>
								(CURRENCY_PAIRS as any).includes(i) ? (
									<CurrencyPair
										key={i}
										currencyPair={i as CURRENCY_PAIR}
										close={() => drawer?.close()}
										opened={isBelowXs || isAboveLg}
									/>
								) : (
									<Symbol
										key={i}
										symbol={i}
										close={() => drawer?.close()}
										opened={isBelowXs || isAboveLg}
									/>
								),
							)
						) : (
							<Text
								align="center"
								fz="xs"
								sx={{ wordBreak: "break-all" }}
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
									close={() => drawer?.close()}
									opened={isBelowXs || isAboveLg}
								/>
							))}
							<AnimatePresence>
								{(isBelowXs || isAboveLg) && (
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
		</MantineNavbar>
	)
}
