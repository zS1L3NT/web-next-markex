import { Flex, Loader } from "@mantine/core"

import { useGetOandaCandlesQuery } from "@/api/prices"
import { CURRENCY_PAIR } from "@/constants"

import CandlestickChart from "./CandlestickChart"

// There is some bug where charts show the full extremes for a split second before setting the extremes
export default function CurrencyChart({
	type,
	currencyPair,
	period,
}: {
	type: "candlestick" | "ohlc"
	currencyPair: CURRENCY_PAIR | null
	period: "H1" | "D" | "W" | "M"
}) {
	const {
		data: candles,
		isFetching: candlesAreFetching,
		status: candlesStatus,
	} = useGetOandaCandlesQuery(
		{ currencyPair: currencyPair as CURRENCY_PAIR, period },
		{ skip: !currencyPair, pollingInterval: 60_000 },
	)

	return candles && !candlesAreFetching ? (
		<CandlestickChart
			type={type}
			candlesAreFetching={candlesAreFetching}
			status={candlesStatus}
			period={period}
			seriesName={currencyPair?.replace("_", " / ") ?? ""}
			candles={candles.map(c => [
				new Date(c.time).getTime(),
				c.mid.o,
				c.mid.h,
				c.mid.l,
				c.mid.c,
			])}
			units={
				[
					period === "H1" ? ["hour", [1]] : null,
					period === "D" ? ["day", [1]] : null,
					period === "W" ? ["week", [1]] : null,
					period === "M" ? ["month", [1]] : null,
				].filter(Boolean) as [[string, [number]]]
			}
		/>
	) : (
		<Flex
			sx={{
				width: "100%",
				height: "100%",
				justifyContent: "center",
				alignItems: "center",
			}}>
			<Loader
				size={24}
				color="gray"
			/>
		</Flex>
	)
}
