import { GetServerSideProps } from "next"
import Head from "next/head"
import { useState } from "react"

import CandlestickChart from "@/components/CandlestickChart"
import { CURRENCY_PAIRS } from "@/constants"
import useCurrencyPairLivePrices from "@/hooks/useCurrencyPairLivePrices"
import {
	Box, Center, Flex, Loader, SegmentedControl, Stack, Text, useMantineTheme
} from "@mantine/core"
import { usePrevious } from "@mantine/hooks"
import { IconCaretUp } from "@tabler/icons-react"

type Props = {
	currencyPair: (typeof CURRENCY_PAIRS)[number]
}

export default function CurrencyPair({ currencyPair }: Props) {
	const currencyPairPretty = currencyPair?.replace("_", " / ")
	const theme = useMantineTheme()

	const price = useCurrencyPairLivePrices([currencyPair])[currencyPair]

	const [type, setType] = useState<"candlestick" | "ohlc">("candlestick")
	const [period, setPeriod] = useState<"H1" | "D" | "W" | "M">("H1")
	const previousPrice = usePrevious(price)

	const buyColor =
		price && previousPrice && price.b !== previousPrice.b
			? price.b > previousPrice.b
				? theme.colors.red[5]
				: theme.colors.green[5]
			: theme.colors.yellow[5]
	const sellColor =
		price && previousPrice && price.s !== previousPrice.s
			? price.s > previousPrice.s
				? theme.colors.green[5]
				: theme.colors.red[5]
			: theme.colors.yellow[5]

	return (
		<>
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
						{price && (
							<Text
								sx={{
									display: "flex",
									alignItems: "center",
									color:
										price?.c > 0 ? theme.colors.green[5] : theme.colors.red[5]
								}}>
								<IconCaretUp
									color="transparent"
									fill={
										price?.c > 0 ? theme.colors.green[5] : theme.colors.red[5]
									}
								/>
								<span>{price?.c}%</span>
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
							<Box
								sx={{
									flex: 1,
									padding: "0.25rem 0.5rem",
									border: `1px solid ${buyColor}`,
									backgroundColor: `${buyColor}22`
								}}>
								{price ? (
									<Text
										fz="lg"
										color={buyColor}
										weight={700}>
										{price.b.toFixed(5)}
									</Text>
								) : (
									<Loader
										sx={{
											display: "block",
											padding: "0.25rem 0"
										}}
										size={27.9}
										color="yellow"
									/>
								)}
								<Text
									fz="sm"
									color={buyColor}>
									Buy
								</Text>
							</Box>
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
							<Box
								sx={{
									flex: 1,
									padding: "0.25rem 0.5rem",
									textAlign: "end",
									border: `1px solid ${sellColor}`,
									backgroundColor: `${sellColor}22`
								}}>
								{price ? (
									<Text
										fz="lg"
										color={sellColor}
										weight={700}>
										{price.s.toFixed(5)}
									</Text>
								) : (
									<Loader
										sx={{
											display: "block",
											marginLeft: "auto",
											padding: "0.25rem 0"
										}}
										size={27.9}
										color="yellow"
									/>
								)}
								<Text
									fz="sm"
									color={buyColor}>
									Sell
								</Text>
							</Box>
						</Flex>
						<Flex gap="xs">
							<Box
								sx={{
									flex: 1,
									padding: "0 0.5rem"
								}}>
								<Text fz="sm">Low</Text>
								{price ? (
									<Text weight={700}>{price.l.toFixed(5)}</Text>
								) : (
									<Loader
										sx={{
											display: "block",
											padding: "0.25rem 0"
										}}
										size={24.8}
										color="white"
									/>
								)}
							</Box>
							<Box
								sx={{
									flex: 1,
									padding: "0 0.5rem",
									textAlign: "end"
								}}>
								<Text fz="sm">High</Text>
								{price ? (
									<Text weight={700}>{price.h.toFixed(5)}</Text>
								) : (
									<Loader
										sx={{
											display: "block",
											marginLeft: "auto",
											padding: "0.25rem 0"
										}}
										size={24.8}
										color="white"
									/>
								)}
							</Box>
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
		</>
	)
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
	return {
		props: {
			currencyPair: context.params!["currency-pair"] as (typeof CURRENCY_PAIRS)[number]
		}
	}
}
