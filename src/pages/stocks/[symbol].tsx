import Highcharts, { SeriesOptionsType } from "highcharts/highstock"
import HighchartsReact from "highcharts-react-official"
import Head from "next/head"
import { useContext, useState } from "react"

import {
	Badge,
	Box,
	Divider,
	Flex,
	Loader,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMediaQuery } from "@mantine/hooks"

import { AlpacaInterval } from "@/@types/alpaca"
import { FinnhubMetric, FinnhubTrend } from "@/@types/finnhub"
import { User } from "@/@types/types"
import { useGetMetricsQuery } from "@/api/metrics"
import {
	useGetAlpacaCandlesQuery,
	useGetLatestQuoteQuery,
	useGetLatestTradeQuery,
} from "@/api/prices"
import { useGetAlpacaSymbolQuery } from "@/api/symbols"
import { useGetTrendsQuery } from "@/api/trends"
import BidAskBox from "@/components/BidAskBox"
import CandlestickChart from "@/components/CandlestickChart"
import Shell from "@/components/Shell"
import { StockLivePricesContext } from "@/contexts/StockLivePricesContext"
import { withSession } from "@/utils/middlewares"

export default function Symbol({ user, symbol }: Props) {
	const theme = useMantineTheme()
	const isBelowSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

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
	const { data: latestTrade } = useGetLatestTradeQuery({ symbol })
	const { data: latestQuote, isFetching: quoteIsFetching } = useGetLatestQuoteQuery({ symbol })
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

	const { data: metrics } = useGetMetricsQuery({ symbol }, { pollingInterval: 60_000 * 5 })
	const { data: trends } = useGetTrendsQuery({ symbol }, { pollingInterval: 60_000 * 5 })

	const form = useForm({
		initialValues: {
			mode: "sell",
			amount: 0 as number | undefined,
		},
	})

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

	const sellBuyValue = <T,>(sell: T, buy: T) => {
		return form.values.mode === "sell" ? sell : buy
	}

	return (
		<Shell user={user}>
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
						{asset ? (
							<Title mt="md">{asset.symbol.toUpperCase()}</Title>
						) : (
							<Skeleton
								w={100}
								h={50}
							/>
						)}
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
											text: "Sentiment",
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
					{metrics &&
						Object.entries(metrics)
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
				</Stack>
			</Flex>
		</Shell>
	)
}

type Props = {
	user: User | null
	symbol: string
}

export const getServerSideProps = withSession<Props>(async ({ user, params }) => {
	return {
		props: {
			user,
			symbol: params["symbol"].toString().toUpperCase(),
		},
	}
})
