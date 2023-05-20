import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
import { useEffect, useRef } from "react"

import { useGetCandlesQuery } from "@/api/prices"
import { Flex, Loader, useMantineTheme } from "@mantine/core"
import { usePrevious } from "@mantine/hooks"

export default function CandlestickChart({
	currencyPair,
	period
}: {
	currencyPair: string | null
	period: "H1" | "D" | "W" | "M"
}) {
	const theme = useMantineTheme()

	const {
		data: candles,
		isFetching: candlesAreFetching,
		status: candlesStatus
	} = useGetCandlesQuery(
		{
			currencyPair: currencyPair!,
			period
		},
		{ skip: !currencyPair }
	)

	const ref = useRef<HighchartsReact.RefObject>(null)

	/**
	 * Store this value so below I can use it to determine if I should animate the navigator
	 * If the candles were fetching, then I don't want to animate the navigator because it will look weird
	 * If the candles were not fetching, then I do want to animate the navigator when switching periods
	 */
	const candlesWereFetching = usePrevious(candlesStatus) === "pending"

	useEffect(() => {
		const navigator = ref.current?.chart?.xAxis?.[0]
		const latestCandle = candles?.at(-1)
		if (navigator && latestCandle) {
			const start = new Date()
			const end = new Date(latestCandle.time)

			switch (period) {
				case "H1":
					start.setHours(end.getHours() - 50)
					break
				case "D":
					start.setDate(end.getDate() - 50)
					break
				case "W":
					start.setDate(end.getDate() - 350)
					break
				case "M":
					start.setMonth(end.getMonth() - 50)
					break
			}

			navigator.setExtremes(start.getTime(), end.getTime(), true, !candlesWereFetching)
		}
	}, [ref, candles, period, candlesWereFetching])

	return candles && !candlesAreFetching ? (
		<HighchartsReact
			ref={ref}
			highcharts={Highcharts}
			constructorType="stockChart"
			options={
				{
					accessibility: {
						enabled: false
					},
					chart: {
						backgroundColor: theme.colors.dark[8],
						style: {
							fontFamily: "inherit"
						}
					},
					rangeSelector: {
						enabled: false
					},
					plotOptions: {
						candlestick: {
							color: theme.colors.red[5],
							upColor: theme.colors.green[5],
							lineColor: theme.colors.gray[0]
						}
					},
					xAxis: {
						lineColor: theme.colors.dark[3],
						tickColor: theme.colors.dark[3],
						labels: {
							style: {
								color: theme.colors.dark[3]
							}
						}
					},
					yAxis: {
						gridLineColor: theme.colors.dark[3],
						labels: {
							style: {
								color: theme.colors.dark[3]
							}
						}
					},
					navigator: {
						maskFill: theme.colors.dark[3] + "88",
						outlineColor: theme.colors.dark[3],
						series: {
							color: theme.colors.blue[5]
						},
						xAxis: {
							gridLineColor: theme.colors.dark[3],
							labels: {
								style: {
									color: theme.colors.gray[3],
									textOutline: theme.colors.gray[3]
								}
							}
						},
						handles: {
							enabled: false
						}
					},
					scrollbar: {
						trackBorderColor: theme.colors.dark[3]
					},
					credits: {
						enabled: false
					},
					series: [
						{
							type: "candlestick",
							name: currencyPair?.replace("_", " / ") ?? "",
							data: candles.map(c => [
								new Date(c.time).getTime(),
								c.mid.o,
								c.mid.h,
								c.mid.l,
								c.mid.c
							]),
							dataGrouping: {
								units: [
									period === "H1" ? ["hour", [1]] : null,
									period === "D" ? ["day", [1]] : null,
									period === "W" ? ["week", [1]] : null,
									period === "M" ? ["month", [1]] : null
								].filter(Boolean) as [[string, [number]]]
							}
						}
					]
				} satisfies Highcharts.Options
			}
		/>
	) : (
		<Flex
			sx={{
				width: "100%",
				height: 400,
				justifyContent: "center",
				alignItems: "center"
			}}>
			<Loader
				size={24}
				color="gray"
			/>
		</Flex>
	)
}
