import Highcharts from "highcharts/highstock"
import HighchartsReact from "highcharts-react-official"
import { useContext, useEffect, useRef, useState } from "react"

import { useMantineTheme } from "@mantine/core"
import { usePrevious } from "@mantine/hooks"

import MediaQueryContext from "@/contexts/MediaQueryContext"

export default function CandlestickChart({
	type,
	seriesName,
	candles,
	candlesAreFetching,
	units = undefined,
	status = undefined,
	period = undefined,
	height = undefined,
}: {
	type: "candlestick" | "ohlc"
	seriesName: string
	candles: [number, number, number, number, number][]
	candlesAreFetching: boolean
	units?: any[] | undefined
	status?: string | undefined
	period?: string | undefined
	height?: number | undefined
}) {
	const theme = useMantineTheme()
	const { isBelowSm } = useContext(MediaQueryContext)

	const [opacity, setOpacity] = useState(0)
	const ref = useRef<HighchartsReact.RefObject>(null)

	/**
	 * Store this value so below I can use it to determine if I should animate the navigator
	 * If the candles were fetching, then I don't want to animate the navigator because it will look weird
	 * If the candles were not fetching, then I do want to animate the navigator when switching periods
	 */
	const candlesWereFetching = usePrevious(status) === "pending"

	useEffect(() => {
		const navigator = ref.current?.chart?.xAxis?.[0]
		const start = candles?.at(-50)
		const end = candles?.at(-1)
		if (navigator && start && end) {
			navigator.setExtremes(
				new Date(start[0]).getTime(),
				new Date(end[0]).getTime(),
				true,
				!candlesWereFetching,
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

	return (
		<HighchartsReact
			ref={ref}
			highcharts={Highcharts}
			constructorType="stockChart"
			options={
				{
					accessibility: {
						enabled: false,
					},
					chart: {
						backgroundColor: theme.colors.dark[8],
						height: isBelowSm ? 300 : height,
						style: {
							fontFamily: "inherit",
							// Default all chart opacities to 0, then animate them to 1
							opacity: 0,
							transition: "opacity 0.5s ease",
						},
					},
					rangeSelector: {
						enabled: false,
					},
					plotOptions: {
						candlestick: {
							color: theme.colors.red[5],
							upColor: theme.colors.green[5],
							lineColor: theme.colors.gray[0],
						},
						ohlc: {
							color: theme.colors.red[5],
							upColor: theme.colors.green[5],
						},
					},
					xAxis: {
						lineColor: theme.colors.dark[3],
						tickColor: theme.colors.dark[3],
						labels: {
							style: {
								color: theme.colors.dark[3],
							},
						},
					},
					yAxis: {
						gridLineColor: theme.colors.dark[3],
						labels: {
							style: {
								color: theme.colors.dark[3],
							},
						},
					},
					navigator: {
						maskFill: theme.colors.dark[3] + "88",
						outlineColor: theme.colors.dark[3],
						series: {
							color: theme.colors.blue[5],
						},
						xAxis: {
							gridLineColor: theme.colors.dark[3],
							labels: {
								style: {
									color: theme.colors.gray[3],
									textOutline: theme.colors.gray[3],
								},
							},
						},
					},
					scrollbar: {
						trackBorderColor: theme.colors.dark[3],
					},
					credits: {
						enabled: false,
					},
					series: [
						{
							type,
							name: seriesName,
							data: candles,
							dataGrouping: {
								units: units,
							},
						},
					],
				} satisfies Highcharts.Options
			}
		/>
	)
}
