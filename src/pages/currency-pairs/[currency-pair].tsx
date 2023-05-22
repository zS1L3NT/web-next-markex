import Head from "next/head"
import { useContext, useEffect, useState } from "react"

import { SessionUser } from "@/@types/iron-session"
import CandlestickChart from "@/components/CandlestickChart"
import Shell from "@/components/Shell"
import { CURRENCY_PAIR } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"
import withSession from "@/utils/withSession"
import {
	Box, Center, Flex, Loader, SegmentedControl, Stack, Text, useMantineTheme
} from "@mantine/core"
import { usePrevious } from "@mantine/hooks"
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react"

type Props = {
	user: SessionUser | null
	currencyPair: CURRENCY_PAIR
}

function BuySellBox({
	type,
	price,
	color
}: {
	type: "Buy" | "Sell"
	price: number | null
	color: "green" | "red" | "white"
}) {
	const theme = useMantineTheme()

	const mantineColor = color === "white" ? "white" : theme.colors[color][5]

	return (
		<Box
			sx={{
				flex: 1,
				padding: "0.25rem 0.5rem",
				textAlign: type === "Buy" ? "start" : "end",
				border: `1px solid ${mantineColor}`,
				backgroundColor: `${mantineColor}22`
			}}>
			{price ? (
				<Flex
					direction={type === "Buy" ? "row" : "row-reverse"}
					align="center">
					<Text
						sx={{ width: "fit-content" }}
						fz="lg"
						color={mantineColor}
						weight={700}>
						{price.toFixed(5)}
					</Text>

					{color === "green" && (
						<IconCaretUp
							color="transparent"
							fill={mantineColor}
						/>
					)}

					{color === "red" && (
						<IconCaretDown
							color="transparent"
							fill={mantineColor}
						/>
					)}
				</Flex>
			) : (
				<Loader
					sx={{
						display: "block",
						marginLeft: type === "Buy" ? "0" : "auto",
						padding: "0.25rem 0"
					}}
					size={27.9}
					color="white"
				/>
			)}
			<Text
				fz="sm"
				color={mantineColor}>
				{type}
			</Text>
		</Box>
	)
}

function LowHighBox({ type, price }: { type: "Low" | "High"; price: number | null }) {
	return (
		<Box
			sx={{
				flex: 1,
				padding: "0 0.5rem",
				textAlign: type === "Low" ? "start" : "end"
			}}>
			<Text fz="sm">{type}</Text>
			{price ? (
				<Text weight={700}>{price.toFixed(5)}</Text>
			) : (
				<Loader
					sx={{
						display: "block",
						marginLeft: type === "Low" ? "0" : "auto",
						padding: "0.25rem 0"
					}}
					size={24.8}
					color="white"
				/>
			)}
		</Box>
	)
}

export default function CurrencyPair({ user, currencyPair }: Props) {
	const currencyPairPretty = currencyPair?.replace("_", " / ")
	const theme = useMantineTheme()
	const { prices, setCurrencyPairs } = useContext(CurrencyPairPricesContext)
	const price = prices[currencyPair]

	const [type, setType] = useState<"candlestick" | "ohlc">("candlestick")
	const [period, setPeriod] = useState<"H1" | "D" | "W" | "M">("H1")
	const [buyColor, setBuyColor] = useState<"green" | "red" | "white">("white")
	const [sellColor, setSellColor] = useState<"green" | "red" | "white">("white")
	const previousCurrencyPair = usePrevious(currencyPair)
	const previousPrice = usePrevious(prices[currencyPair])

	useEffect(() => {
		setCurrencyPairs([currencyPair])
	}, [currencyPair])

	useEffect(() => {
		if (price && previousPrice && currencyPair === previousCurrencyPair) {
			if (price.b !== previousPrice.b) {
				setBuyColor(price.b > previousPrice.b ? "green" : "red")
			}

			if (price.s !== previousPrice.s) {
				setSellColor(price.s > previousPrice.s ? "green" : "red")
			}
		}
	}, [previousCurrencyPair, currencyPair, price, previousPrice])

	return (
		<Shell user={user}>
			<Head>
				<title>{"Markex | " + currencyPairPretty}</title>
			</Head>

			<Stack p="md">
				<Flex
					justify="space-between"
					mb="md">
					<Box>
						<Text
							fz={40}
							weight={700}>
							{currencyPairPretty}
						</Text>
						{price && price.c !== 0 && (
							<Text
								sx={{
									display: "flex",
									alignItems: "center",
									color: price.c
										? price.c > 0
											? theme.colors.green[5]
											: theme.colors.red[5]
										: "white"
								}}>
								<IconCaretUp
									color="transparent"
									fill={price.c > 0 ? theme.colors.green[5] : theme.colors.red[5]}
								/>
								<span>{price.c}%</span>
							</Text>
						)}
					</Box>

					<Flex
						sx={{ width: 320 }}
						direction="column"
						gap="xs">
						<Flex
							sx={{ position: "relative" }}
							gap="xs">
							<BuySellBox
								type="Buy"
								price={price?.b ?? null}
								color={buyColor}
							/>
							<Box
								sx={{
									width: "30%",
									height: "60%",
									border: `1px solid ${theme.colors.blue[5]}`,
									backgroundColor: theme.colors.dark[7],
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									zIndex: 2
								}}>
								<Center
									sx={{
										width: "100%",
										height: "100%",
										backgroundColor: theme.colors.blue[5] + "22"
									}}>
									{price ? (
										<Text
											color={theme.colors.blue[5]}
											weight={700}>
											{price.sp}
										</Text>
									) : (
										<Loader
											sx={{ padding: "0.25rem 0" }}
											height={24.8}
										/>
									)}
								</Center>
							</Box>
							<BuySellBox
								type="Sell"
								price={price?.s ?? null}
								color={sellColor}
							/>
						</Flex>
						<Flex gap="xs">
							<LowHighBox
								type="Low"
								price={price?.l ?? null}
							/>
							<LowHighBox
								type="High"
								price={price?.h ?? null}
							/>
						</Flex>
					</Flex>
				</Flex>

				<SegmentedControl
					data={[
						{ label: "Candlestick", value: "candlestick" },
						{ label: "OHLC", value: "ohlc" }
					]}
					value={type}
					onChange={t => setType(t as typeof type)}
				/>

				<SegmentedControl
					data={[
						{ label: "Hourly", value: "H1" },
						{ label: "Daily", value: "D" },
						{ label: "Weekly", value: "W" },
						{ label: "Monthly", value: "M" }
					]}
					value={period}
					onChange={p => setPeriod(p as typeof period)}
				/>

				<CandlestickChart
					type={type}
					currencyPair={currencyPair}
					period={period}
				/>
			</Stack>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session, params }) => {
	return {
		props: {
			user: session.user ?? null,
			currencyPair: params!["currency-pair"] as CURRENCY_PAIR
		}
	}
})
