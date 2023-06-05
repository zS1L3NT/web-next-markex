import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { ForwardedRef, forwardRef, useImperativeHandle, useState } from "react"

import { Box, Flex, Grid, Loader, Modal, Skeleton, Text, useMantineTheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"

import { useGetFXEmpireHistoryQuery } from "@/api/news"

export type EventHistoryModalRef = {
	open: (_: { country: string; category: string }) => void
	close: () => void
}

export default forwardRef(function EventHistory(_, ref: ForwardedRef<EventHistoryModalRef>) {
	const theme = useMantineTheme()

	const [opened, { open, close }] = useDisclosure(false)
	const [country, setCountry] = useState<string | null>(null)
	const [category, setCategory] = useState<string | null>(null)

	const { data: history, isFetching: historyIsFetching } = useGetFXEmpireHistoryQuery(
		{ country: country ?? "", category: category ?? "" },
		{ skip: !country || !category },
	)

	useImperativeHandle(ref, () => ({
		open: ({ country, category }) => {
			open()
			setCountry(country)
			setCategory(category)
		},
		close,
	}))

	return (
		<Modal
			opened={opened}
			onClose={close}
			centered
			size="xl"
			title="History">
			<Flex
				sx={{ flexDirection: "column" }}
				gap="lg"
				py="sm">
				{history && !historyIsFetching ? (
					<HighchartsReact
						highcharts={Highcharts}
						constructorType="chart"
						options={
							{
								accessibility: {
									enabled: false,
								},
								chart: {
									backgroundColor: theme.colors.dark[7],
								},
								xAxis: {
									categories: history.history.map(c => c.formattedDate),
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
									title: {
										text: history.summary.unit,
									},
									labels: {
										style: {
											color: theme.colors.dark[3],
										},
									},
								},
								scrollbar: {
									trackBorderColor: theme.colors.dark[3],
								},
								title: {
									text: history.summary.category.name,
									style: {
										color: theme.colors.dark[1],
									},
								},
								credits: {
									enabled: false,
								},
								legend: {
									enabled: false,
								},
								tooltip: {
									pointFormat: `<b>{point.y}</b> ${history.summary.unit}`,
								},
								series: [
									{
										type: "column",
										name: "HELLO",
										data: history.history.map(c => [c.formattedDate, c.close]),
										colorByPoint: true,
										colors: history.history.map(
											c => theme.colors[c.close > 0 ? "green" : "red"][5],
										),
									},
								],
							} satisfies Highcharts.Options
						}
					/>
				) : (
					<Loader
						height={400}
						size={20}
						color="gray"
						display="block"
						m="auto"
					/>
				)}

				<Grid gutter={24}>
					{(["highest", "lowest", "last", "previous"] as const).map(k => (
						<Grid.Col
							key={k}
							xs={3}
							span={6}>
							<Box
								w="fit-content"
								m="auto">
								<Text
									align="center"
									weight={700}>
									{k[0]?.toUpperCase() + k.substring(1)}
								</Text>
								<Text
									align="center"
									fz="xl">
									{!historyIsFetching ? (
										history?.summary?.[k].value
									) : (
										<Skeleton
											w={100}
											h={31}
										/>
									)}
								</Text>
								<Text
									align="center"
									c="dimmed"
									fz="xs">
									{history?.summary?.[k].time}
								</Text>
							</Box>
						</Grid.Col>
					))}
					{(["next", "range", "frequency", "unit"] as const).map(k => (
						<Grid.Col
							key={k}
							xs={3}
							span={6}>
							<Box
								w="fit-content"
								m="auto">
								<Text
									align="center"
									weight={700}>
									{k[0]?.toUpperCase() + k.substring(1)}
								</Text>
								<Text
									align="center"
									fz="xl">
									{!historyIsFetching ? (
										k === "next" ? (
											history?.summary?.[k].time || "Unknown"
										) : (
											history?.summary?.[k]
										)
									) : (
										<Skeleton
											w={100}
											h={31}
										/>
									)}
								</Text>
							</Box>
						</Grid.Col>
					))}
				</Grid>
			</Flex>
		</Modal>
	)
})
