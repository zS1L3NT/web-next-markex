import Head from "next/head"
import Link from "next/link"
import { CSSProperties, useEffect, useRef, useState } from "react"

import { ActionIcon, Box, Flex, Skeleton, Table, Title } from "@mantine/core"
import { useMantineTheme } from "@mantine/core"
import { IconCalendar } from "@tabler/icons-react"

import { useGetFinnhubEarningsQuery } from "@/api/extras"
import { useLazyGetAlpacaLatestQuoteQuery, useLazyGetAlpacaLatestTradeQuery } from "@/api/prices"
import {
	useGetAlpacaSymbolsQuery,
	useGetFXEmpirePopularSymbolsQuery,
	useLazyGetAlpacaSymbolQuery,
} from "@/api/symbols"
import EventsDatesModal, { EventsDatesModalRef } from "@/components/Modals/EventsDatesModal"
import Shell from "@/components/Shell"

export default function Stocks() {
	const startOfWeek = (date: Date) => {
		const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
		return new Date(date.setDate(diff))
	}

	const nextMonth = (date: Date) => {
		return new Date(date.setMonth(date.getMonth() + 1))
	}

	const [minutes, setMinutes] = useState<number>(0)
	const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()))
	const [endDate, setEndDate] = useState<Date>(startOfWeek(nextMonth(new Date())))
	const [rows, setRows] = useState<
		{
			name: string
			ticker: string
			price: number
			askPrice: string
			bidPrice: string
			updated: Date
		}[]
	>([])

	const { data: results } = useGetFXEmpirePopularSymbolsQuery(
		{ category: "stocks", size: 100, locale: "en" },
		{ pollingInterval: 60_000 * 5 },
	)
	const { data: earnings, isFetching: earningsAreFetching } = useGetFinnhubEarningsQuery({
		startDate: startDate,
		endDate: endDate,
	})
	const { data: symbols } = useGetAlpacaSymbolsQuery()

	const [getAlpacaSymbol] = useLazyGetAlpacaSymbolQuery()
	const [getLatestTrade] = useLazyGetAlpacaLatestTradeQuery()
	const [getLatestQuote] = useLazyGetAlpacaLatestQuoteQuery()
	const theme = useMantineTheme()
	const eventsDatesModalRef = useRef<EventsDatesModalRef>(null)

	useEffect(() => {
		const calls = results?.items
			.filter(x => x.exchange === "NASDAQ")
			.map(
				async x =>
					await Promise.all([
						(await getAlpacaSymbol({ symbol: x.title })).data!,
						(await getLatestTrade({ symbol: x.title })).data!,
						(await getLatestQuote({ symbol: x.title })).data!,
					]),
			)

		Promise.all(calls ?? []).then(res => {
			const date = new Date()
			setRows(
				res.map(([{ symbol: ticker, name }, { trade }, { quote }]) => {
					return {
						price: trade.p,
						ticker: ticker,
						name: name,
						askPrice: quote.ap.toFixed(2),
						bidPrice: quote.bp.toFixed(2),
						updated: date,
					}
				}),
			)
		})
	}, [results, getAlpacaSymbol, getLatestTrade, getLatestQuote])

	useEffect(() => {
		setMinutes(0)
		const interval = setInterval(() => {
			setMinutes(minutes => minutes + 1)
		}, 60_000)

		return () => clearInterval(interval)
	}, [rows])

	const numericHeaderStyle: CSSProperties = {
		width: "10%",
		textAlign: "center",
	}

	const loader = (
		<Skeleton
			width="100%"
			height={20}
		/>
	)

	return (
		<Shell>
			<Head>
				<title>{"Markex | Stocks"}</title>
			</Head>
			<Title my="md">Trending</Title>
			<Box sx={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
				<Table
					bg={theme.colors.dark[6]}
					highlightOnHover
					withBorder
					withColumnBorders>
					<thead>
						<tr>
							<th style={numericHeaderStyle}>Ticker</th>
							<th>Name</th>
							<th style={numericHeaderStyle}>Price</th>
							<th style={numericHeaderStyle}>Bid</th>
							<th style={numericHeaderStyle}>Ask</th>
							<th style={numericHeaderStyle}>Updated</th>
						</tr>
					</thead>
					<tbody>
						{rows.length > 0
							? rows.map(row => {
									return (
										<tr
											style={{ textAlign: "center" }}
											key={row.ticker}>
											<td>
												<Link
													style={{
														color: "white",
														textDecoration: "none",
													}}
													href={"/stocks/" + row.ticker}>
													{row.ticker}
												</Link>
											</td>
											<td>
												<Link
													style={{
														color: "white",
														textDecoration: "none",
													}}
													href={"/stocks/" + row.ticker}>
													<Flex>{row.name}</Flex>
												</Link>
											</td>
											<td>{row.price}</td>
											<td>{row.bidPrice}</td>
											<td>{row.askPrice}</td>
											<td>
												{minutes === 0 ? "Just now" : minutes + "m ago"}
											</td>
										</tr>
									)
							  })
							: results?.items
									.filter(x => x.exchange === "NASDAQ")
									.map(x => {
										return (
											<tr
												style={{ textAlign: "center" }}
												key={x.title}>
												<td>{x.title}</td>
												{Array.from({ length: 5 }, (_, index) => (
													<td key={index}>{loader}</td>
												))}
											</tr>
										)
									})}
					</tbody>
				</Table>
			</Box>
			<Title my="md">Earnings Calendar</Title>
			<ActionIcon
				mb="md"
				variant="filled"
				color="blue"
				size="lg"
				onClick={eventsDatesModalRef.current?.open}
				disabled={earningsAreFetching}>
				<IconCalendar size="1.5rem" />
			</ActionIcon>
			<Box sx={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
				<Table
					bg={theme.colors.dark[6]}
					highlightOnHover
					withBorder
					withColumnBorders>
					<thead>
						<tr>
							<th style={numericHeaderStyle}>Ticker</th>
							<th>Name</th>
							<th style={numericHeaderStyle}>Date</th>
							<th style={numericHeaderStyle}>Release</th>
							<th style={numericHeaderStyle}>Quarter</th>
							<th style={numericHeaderStyle}>Est. Revenue</th>
							<th style={numericHeaderStyle}>Actual Revenue</th>
						</tr>
					</thead>
					<tbody>
						{earnings
							?.filter(x => symbols?.map(x => x.symbol).includes(x.symbol))
							.sort((a, b) => a.date.localeCompare(b.date))
							.map(
								({
									year,
									symbol,
									quarter,
									date,
									revenueEstimate,
									revenueActual,
									hour,
								}) => {
									return (
										symbols?.find(x => x.symbol === symbol)?.tradable && (
											<tr
												style={{ textAlign: "center" }}
												key={`${symbol}-${year}-${quarter}-${revenueEstimate}-${revenueActual}`}>
												<td>
													<Link
														style={{
															color: "white",
															textDecoration: "none",
														}}
														href={"/stocks/" + symbol}>
														{symbol}
													</Link>
												</td>
												<td>
													<Link
														style={{
															color: "white",
															textDecoration: "none",
														}}
														href={"/stocks/" + symbol}>
														<Flex>
															{
																symbols?.find(
																	x => symbol === x.symbol,
																)?.name
															}
														</Flex>
													</Link>
												</td>
												<td>{date}</td>
												<td>{hour}</td>
												<td>{`${year} Q${quarter}`}</td>
												<td>{revenueEstimate}</td>
												<td>{revenueActual}</td>
											</tr>
										)
									)
								},
							)}
					</tbody>
				</Table>
			</Box>
			<EventsDatesModal
				{...{
					ref: eventsDatesModalRef,
					startDate,
					endDate,
					setStartDate,
					setEndDate,
				}}
			/>
		</Shell>
	)
}
