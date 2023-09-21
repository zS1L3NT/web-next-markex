import Highcharts, { SeriesOptionsType } from "highcharts/highstock"
import HighchartsReact from "highcharts-react-official"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import { useSession } from "next-auth/react"
import { useContext, useState } from "react"

import {
	ActionIcon,
	Badge,
	Box,
	Divider,
	Flex,
	Group,
	Loader,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core"
import { IconBookmark } from "@tabler/icons-react"

import { AlpacaInterval } from "@/@types/alpaca"
import { FinnhubMetric, FinnhubTrend } from "@/@types/finnhub"
import { useGetBookmarksQuery, useUpdateBookmarksMutation } from "@/api/bookmarks"
import { useGetFinnhubMetricsQuery, useGetFinnhubTrendsQuery } from "@/api/extras"
import {
	useGetAlpacaCandlesQuery,
	useGetAlpacaLatestQuoteQuery,
	useGetAlpacaLatestTradeQuery,
} from "@/api/prices"
import { useGetAlpacaSymbolQuery } from "@/api/symbols"
import BidAskBox from "@/components/BidAskBox"
import CandlestickChart from "@/components/CandlestickChart"
import Shell from "@/components/Shell"
import MediaQueryContext from "@/contexts/MediaQueryContext"
import { StockLivePricesContext } from "@/contexts/StockLivePricesContext"

type Props = {
	symbol: string
}

export default function Symbol({ symbol }: Props) {
	const { data: session } = useSession()
	const { isBelowSm } = useContext(MediaQueryContext)
	const theme = useMantineTheme()

	const { data: bookmarks } = useGetBookmarksQuery(undefined, {
		pollingInterval: 60_000,
		skip: !session,
	})
	const [updateBookmarks, { isLoading: updateBookmarksIsLoading }] = useUpdateBookmarksMutation()

	const intervals = [
		{ displayName: "1m", value: "1Min" },
		{ displayName: "5m", value: "5Min" },
		{ displayName: "15m", value: "15Min" },
		{ displayName: "30m", value: "30Min" },
		{ displayName: "1h", value: "1Hour" },
		{ displayName: "4h", value: "4Hour" },
		{ displayName: "D", value: "1Day" },
		{ displayName: "W", value: "1Week" },
	]

	const metricKeyMappings: {
		[key in keyof FinnhubMetric]: string
	} = {
		"10DayAverageTradingVolume": "Avg vol (10 days)",
		"3MonthAverageTradingVolume": "Avg vol (3 months)",
		"52WeekHigh": "52 week high",
		"52WeekLow": "52 week low",
		beta: "Beta",
		epsTTM: "EPS (TTM)",
		peTTM: "P/E (TTM)",
		marketCapitalization: "Market cap",
		roaTTM: "ROA (TTM)",
		roeTTM: "ROE (TTM)",
	}

	const { price, quote } = useContext(StockLivePricesContext)
	const [chart, setChart] = useState<"ohlc" | "candlestick">("candlestick")
	const [interval, setInterval] = useState<AlpacaInterval>("1Hour")
	const { data: latestTrade } = useGetAlpacaLatestTradeQuery({ symbol })
	const { data: latestQuote, isFetching: quoteIsFetching } = useGetAlpacaLatestQuoteQuery({
		symbol,
	})
	const { data: asset } = useGetAlpacaSymbolQuery({ symbol })
	const {
		data: candles,
		status: candlesStatus,
		isFetching: candlesAreFetching,
	} = useGetAlpacaCandlesQuery(
		{
			symbol,
			interval,
		},
		{
			pollingInterval: 60_000 * 5,
		},
	)

	const { data: metrics } = useGetFinnhubMetricsQuery({ symbol }, { pollingInterval: 60_000 * 5 })
	const { data: trends } = useGetFinnhubTrendsQuery({ symbol }, { pollingInterval: 60_000 * 5 })

	const keyMappings: {
		[key in keyof Omit<FinnhubTrend, "symbol" | "period">]: string
	} = {
		strongBuy: "Strong Buy",
		buy: "Buy",
		hold: "Hold",
		sell: "Sell",
		strongSell: "Strong Sell",
	}

	const series =
		trends && trends.length > 0
			? Object.keys(keyMappings).map(key => {
					return {
						name: keyMappings[key as keyof Omit<FinnhubTrend, "symbol" | "period">],
						data: trends.map(trend => trend[key as keyof FinnhubTrend]),
					}
			  })
			: []

	const toggleBookmark = async () => {
		if (!bookmarks) return
		await updateBookmarks(
			bookmarks.includes(symbol)
				? bookmarks.filter(b => b !== symbol)
				: [...bookmarks, symbol],
		)
	}

	return (
		<Shell>
			{asset && (
				<Head>
					<title>{"Markex | " + asset.symbol.toUpperCase()}</title>
				</Head>
			)}
			<Flex direction={isBelowSm ? "column" : "row"}>
				<Flex
					sx={{
						flex: 1,
					}}
					direction={"column"}
					gap={"md"}>
					<Stack>
						<Stack spacing={"xs"}>
							{asset ? (
								<Group
									spacing={"md"}
									mt={"md"}
									align={"center"}>
									<Title>{asset.symbol.toUpperCase()}</Title>
									<ActionIcon
										disabled={!session}
										loading={updateBookmarksIsLoading}
										radius={"lg"}
										color="blue"
										variant="filled"
										size="md"
										onClick={toggleBookmark}
										aria-label="Bookmark">
										<IconBookmark
											fill={
												bookmarks?.includes(symbol)
													? "white"
													: "transparent"
											}
											style={{ width: "60%", height: "60%" }}
											stroke={1.5}
										/>
									</ActionIcon>
								</Group>
							) : (
								<Skeleton
									w={100}
									h={50}
								/>
							)}
							{asset ? (
								<Text>{asset.name}</Text>
							) : (
								<Skeleton
									w={100}
									h={24.8}
								/>
							)}
						</Stack>
						{latestTrade || price ? (
							<Title
								order={2}
								sx={{
									display: "flex",
									alignItems: "center",
									color: "white",
								}}>
								${(price ?? latestTrade?.trade.p)?.toFixed(2)}
							</Title>
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
									{ label: "Candles", value: "candlestick" },
									{ label: "OHLC", value: "ohlc" },
								]}
								value={chart}
								onChange={val => setChart(val as typeof chart)}
							/>
							<SegmentedControl
								color="blue"
								data={intervals.map(({ displayName, value }) => {
									return { value: value, label: displayName }
								})}
								value={interval}
								onChange={val => setInterval(val as typeof interval)}
							/>
						</Flex>
					</Stack>
					{candles && !candlesAreFetching ? (
						<CandlestickChart
							height={600}
							type={chart}
							candlesAreFetching={candlesAreFetching}
							status={candlesStatus}
							period={interval}
							seriesName={symbol.toUpperCase()}
							units={[["minute", [1, 5, 15, 30]]]}
							candles={candles.bars.map(({ t, o, h, l, c }) => [
								new Date(t).getTime(),
								o,
								h,
								l,
								c,
							])}
						/>
					) : (
						<Flex
							sx={{
								width: "100%",
								height: "600px",
								justifyContent: "center",
								alignItems: "center",
							}}>
							<Loader
								size={24}
								color="gray"
							/>
						</Flex>
					)}

					{trends && trends.length > 0 && (
						<>
							<Divider
								mt={"sm"}
								mb={"lg"}
							/>
							<HighchartsReact
								highcharts={Highcharts}
								options={
									{
										chart: {
											type: "column",
											backgroundColor: "transparent",
										},
										title: {
											text: undefined,
										},
										legend: {
											itemStyle: {
												color: theme.colors.gray[5],
											},
											itemHoverStyle: {
												color: theme.colors.gray[7],
											},
										},
										xAxis: {
											categories: trends.map(({ period }) => period),
											gridLineColor: theme.colors.dark[5],
											labels: {
												style: {
													color: theme.colors.gray[5],
												},
											},
										},
										yAxis: {
											gridLineColor: theme.colors.dark[5],
											labels: {
												style: {
													color: theme.colors.gray[5],
												},
											},
											title: {
												text: "Trends",
											},
										},
										credits: {
											enabled: false,
										},
										series: series as SeriesOptionsType[],
										plotOptions: {
											column: {
												stacking: "normal",
											},
											series: {
												borderWidth: 0,
											},
										},
										colors: [
											theme.colors.green[9],
											theme.colors.green[7],
											theme.colors.yellow[8],
											theme.colors.pink[8],
											theme.colors.red[8],
										],
									} satisfies Highcharts.Options
								}
							/>
						</>
					)}
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
							animate={quoteIsFetching}
							value={(quote?.bidPrice ?? latestQuote?.quote.bp)?.toFixed(2) ?? null}
							color={"white"}
						/>
						<BidAskBox
							type="Ask"
							animate={quoteIsFetching}
							value={(quote?.askPrice ?? latestQuote?.quote.ap)?.toFixed(2) ?? null}
							color={"white"}
						/>
					</Flex>
					<Divider />
					{metrics && (
						<>
							<Text fw={500}>Key Metrics</Text>
							{Object.entries(metrics)
								.filter(([key]) => key in metricKeyMappings)
								.map(([key, value]) => {
									return (
										<Box
											key={`${symbol}-${key}`}
											sx={{
												borderBottom: `1px solid ${theme.colors.gray[8]}`,
											}}>
											<Flex
												pb="xs"
												align={"center"}>
												<Badge size="xs">
													{metricKeyMappings[key as keyof FinnhubMetric]}
												</Badge>
												<div
													style={{
														flex: "auto",
													}}></div>
												<Text fz={"sm"}>{value}</Text>
											</Flex>
										</Box>
									)
								})}
						</>
					)}
				</Stack>
			</Flex>
		</Shell>
	)
}

export const getServerSideProps = async ({ params }: GetServerSidePropsContext) => {
	return {
		props: {
			symbol: (params!["symbol"] as string).toUpperCase(),
		},
	}
}
