import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import Image from "next/image"
import { useContext, useEffect, useState } from "react"

import {
	Box,
	Center,
	Divider,
	Flex,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core"
import { useMediaQuery, usePrevious } from "@mantine/hooks"
import { IconArrowsHorizontal, IconCaretDown, IconCaretUp } from "@tabler/icons-react"

import BidAskBox from "@/components/BidAskBox"
import CurrencyChart from "@/components/CurrencyChart"
import Shell from "@/components/Shell"
import { CURRENCY, CURRENCY_FLAGS, CURRENCY_PAIR } from "@/constants"
import CurrencyPairPricesContext from "@/contexts/CurrencyPairPricesContext"

type Props = {
	currencyPair: CURRENCY_PAIR
}

function LowHighBox({ type, price }: { type: "Low" | "High"; price: number | null }) {
	return (
		<Box
			sx={{
				flex: 1,
				padding: "0 0.5rem",
				textAlign: type === "Low" ? "start" : "end",
			}}>
			<Text fz="sm">{type}</Text>
			{price ? (
				<Text weight={700}>{price}</Text>
			) : (
				<Skeleton
					width="60%"
					height={16.8}
					ml={type === "Low" ? 0 : "auto"}
					my={4}
				/>
			)}
		</Box>
	)
}

export default function CurrencyPair({ currencyPair }: Props) {
	const [base, quote] = currencyPair.split("_") as [CURRENCY, CURRENCY]
	const currencyPairPretty = currencyPair?.replace("_", " / ")
	const { prices, setCurrencyPairs } = useContext(CurrencyPairPricesContext)
	const theme = useMantineTheme()

	const isBelowSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const [type, setType] = useState<"candlestick" | "ohlc">("candlestick")
	const [period, setPeriod] = useState<"H1" | "D" | "W" | "M">("H1")
	const [bidColor, setBidColor] = useState<"green" | "red" | "white">("white")
	const [askColor, setAskColor] = useState<"green" | "red" | "white">("white")
	const previousCurrencyPair = usePrevious(currencyPair)
	const previousPrice = usePrevious(prices[currencyPair])

	const price = prices[currencyPair]

	useEffect(() => {
		setCurrencyPairs([currencyPair])
	}, [currencyPair, setCurrencyPairs])

	useEffect(() => {
		if (price && previousPrice && currencyPair === previousCurrencyPair) {
			if (price.b !== previousPrice.b) {
				setAskColor(price.b > previousPrice.b ? "green" : "red")
			}

			if (price.s !== previousPrice.s) {
				setBidColor(price.s > previousPrice.s ? "green" : "red")
			}
		}
	}, [previousCurrencyPair, currencyPair, price, previousPrice])

	return (
		<Shell>
			<Head>
				<title>{"Markex | " + currencyPairPretty}</title>
			</Head>

			<Flex
				sx={{ overflow: "hidden" }}
				h="100%"
				direction={isBelowSm ? "column" : "row"}>
				<Flex
					sx={{
						flex: 1,
						overflow: "hidden",
					}}
					direction="column"
					gap="md">
					<Stack>
						<Title mt="md">
							<Flex
								align="center"
								gap="sm">
								<Stack
									sx={{ flexDirection: "row", alignItems: "center" }}
									spacing="0.5rem">
									<Image
										src={CURRENCY_FLAGS[base]}
										alt={base}
										width={48}
										height={36}
									/>
									{base}
								</Stack>
								<IconArrowsHorizontal size={34} />
								<Stack
									sx={{ flexDirection: "row", alignItems: "center" }}
									spacing="0.5rem">
									{quote}
									<Image
										src={CURRENCY_FLAGS[quote]}
										alt={quote}
										width={48}
										height={36}
									/>
								</Stack>
							</Flex>
						</Title>

						{price ? (
							<Text
								sx={{
									display: "flex",
									alignItems: "center",
									color: price.c
										? theme.colors[price.c > 0 ? "green" : "red"][5]
										: "white",
								}}>
								{price.c > 0 ? (
									<IconCaretUp
										color="transparent"
										fill={theme.colors.green[5]}
									/>
								) : null}
								{price.c < 0 ? (
									<IconCaretDown
										color="transparent"
										fill={theme.colors.red[5]}
									/>
								) : null}
								<span>{price.c}%</span>
							</Text>
						) : (
							<Skeleton
								w={100}
								h={24.8}
							/>
						)}

						<Flex direction={isBelowSm ? "column" : "row"}>
							<SegmentedControl
								color="blue"
								data={[
									{ label: "Candlestick", value: "candlestick" },
									{ label: "OHLC", value: "ohlc" },
								]}
								value={type}
								onChange={t => setType(t as typeof type)}
							/>

							<SegmentedControl
								color="blue"
								data={[
									{ label: "Hourly", value: "H1" },
									{ label: "Daily", value: "D" },
									{ label: "Weekly", value: "W" },
									{ label: "Monthly", value: "M" },
								]}
								value={period}
								onChange={p => setPeriod(p as typeof period)}
							/>
						</Flex>
					</Stack>

					<Box
						sx={{
							flex: 1,
							height: "100%",
							"& div": {
								height: isBelowSm ? 300 : "calc(100% - 8px) !important",
							},
						}}>
						<CurrencyChart
							type={type}
							currencyPair={currencyPair}
							period={period}
						/>
					</Box>
				</Flex>

				<Divider
					orientation={isBelowSm ? "horizontal" : "vertical"}
					mb={isBelowSm ? "md" : 0}
					mx={isBelowSm ? 0 : "md"}
				/>

				<Stack w={isBelowSm ? "100%" : 320}>
					<Flex
						sx={{ position: "relative" }}
						gap="xs">
						<BidAskBox
							type="Bid"
							value={price?.s ?? null}
							color={askColor}
						/>
						<Box
							sx={{
								width: "20%",
								height: "60%",
								border: `1px solid ${theme.colors.blue[5]}`,
								backgroundColor: theme.colors.dark[7],
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								zIndex: 2,
							}}>
							<Center
								sx={{
									width: "100%",
									height: "100%",
									backgroundColor: theme.colors.blue[5] + "22",
								}}>
								{price ? (
									<Text
										color={theme.colors.blue[5]}
										weight={700}>
										{price.sp}
									</Text>
								) : (
									<Skeleton
										width="60%"
										height={24.8}
									/>
								)}
							</Center>
						</Box>
						<BidAskBox
							type="Ask"
							value={price?.b ?? null}
							color={bidColor}
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

					<Divider />

					{/** More information about currency pair */}
				</Stack>
			</Flex>
		</Shell>
	)
}

export const getServerSideProps = async ({ params }: GetServerSidePropsContext) => {
	return {
		props: {
			currencyPair: (params!["currency-pair-id"] as string)
				.toUpperCase()
				.replace("-", "_") as CURRENCY_PAIR,
		},
	}
}
