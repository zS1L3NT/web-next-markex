import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
import { useEffect, useRef, useState } from "react"

import { useGetOandaCandlesQuery } from "@/api/prices"
import { CURRENCY_PAIR } from "@/constants"
import { Flex, Loader, useMantineTheme } from "@mantine/core"
import { usePrevious } from "@mantine/hooks"

// There is some bug where charts show the full extremes for a split second before setting the extremes
export default function CandlestickChart({
	type,
	currencyPair,
	period
}: {
	type: "candlestick" | "ohlc"
	currencyPair: CURRENCY_PAIR | null
	period: "H1" | "D" | "W" | "M"
}) {
	const theme = useMantineTheme()

	const {
		data: candles,
		isFetching: candlesAreFetching,
		status: candlesStatus
	} = useGetOandaCandlesQuery(
		{ currencyPair: currencyPair!, period },
		{ skip: !currencyPair, pollingInterval: 60_000 }
	)

	const [opacity, setOpacity] = useState(0)
	const ref = useRef<HighchartsReact.RefObject>(null)

	/**
	 * Store this value so below I can use it to determine if I should animate the navigator
	 * If the candles were fetching, then I don't want to animate the navigator because it will look weird
	 * If the candles were not fetching, then I do want to animate the navigator when switching periods
	 */
	const candlesWereFetching = usePrevious(candlesStatus) === "pending"

	useEffect(() => {
		const navigator = ref.current?.chart?.xAxis?.[0]
		const start = candles?.at(-50)
		const end = candles?.at(-1)
		if (navigator && start && end) {
			navigator.setExtremes(
				new Date(start.time).getTime(),
				new Date(end.time).getTime(),
				true,
				!candlesWereFetching
			)

			// After 10ms, set the opacity of the chart to 1
			// This delay is needed so that the chart can rerender the extremes before being displayed
			setTimeout(() => setOpacity(1), 10)
		}
	}, [ref, candles, period, candlesWereFetching])

	useEffect(() => {
		// Every time the user changes the period
		// Hide the chart IF the candles are being fetched
		// This ensures that if the data is new (being fetched), the chart is hidden until the extremes are set
		// If the data has already been fetched, I don't want to hide the chart since the charts animate into each other
		setOpacity(candlesAreFetching ? 0 : 1)
	}, [candlesAreFetching, period])

	// Every time the opacity changes, update the DOM accordingly
	// This needs to be done manually since the Highcharts is not rendered in React
	useEffect(() => {
		const chartContainer = document.querySelector<HTMLDivElement>(".highcharts-container")
		const chartRoot = document.querySelector<SVGElement>(".highcharts-root")
		if (chartContainer && chartRoot) {
			chartContainer.style.opacity = opacity + ""
			chartRoot.style.opacity = opacity + ""
		}
	}, [opacity])

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
							fontFamily: "inherit",
							// Default all chart opacities to 0, then animate them to 1
							opacity: 0,
							transition: "opacity 0.5s ease"
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
						},
						ohlc: {
							color: theme.colors.red[5],
							upColor: theme.colors.green[5]
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
							type,
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
				height: "100%",
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
