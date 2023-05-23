import { AnimatePresence, motion } from "framer-motion"
import Head from "next/head"
import Link from "next/link"
import { Fragment, useEffect, useState } from "react"

import { FXEmpireEvent } from "@/@types/fxempire"
import { SessionUser } from "@/@types/iron-session"
import { useGetFXStreetEventsQuery, useGetFXStreetNewsQuery } from "@/api/news"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY_FLAGS, FXEMPIRE_COUNTRIES } from "@/constants"
import useIsInViewportState from "@/hooks/useIsInViewportState"
import withSession from "@/utils/withSession"
import {
	ActionIcon, Badge, Card, Flex, Grid, Image, Loader, SegmentedControl, Stack, Table, Text,
	useMantineTheme
} from "@mantine/core"
import { IconCalendar, IconFilter } from "@tabler/icons-react"

type Props = {
	user: SessionUser | null
}

export default function Dashboard({ user }: Props) {
	const theme = useMantineTheme()

	const [page, setPage] = useState(1)
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24))
	const [impact, setImpact] = useState<number>(1)
	const [countries, setCountries] = useState(CURRENCIES)
	const { data: news, isLoading: newsAreLoading } = useGetFXStreetNewsQuery()
	const { data: eventsQuery, isFetching: eventsAreFetching } = useGetFXStreetEventsQuery({
		page,
		from: startDate,
		to: endDate,
		impact,
		countries: countries.map(c => FXEMPIRE_COUNTRIES[c])
	})

	// Allows the UI to have time to update before re-rendering the loader
	const [isFetchingLock, setIsFetchingLock] = useState(false)
	const [events, setEvents] = useState<[string, FXEmpireEvent[]][]>([])
	const [isAtBottom, setIsAtBottom, ref] = useIsInViewportState()

	useEffect(() => {
		if (!newsAreLoading && !isFetchingLock && isAtBottom && eventsQuery?.next) {
			setPage(page => page + 1)
		}
	}, [newsAreLoading, isFetchingLock, isAtBottom, eventsQuery?.next])

	useEffect(() => {
		if (eventsQuery?.events) {
			setEvents(events => {
				const map = Object.fromEntries(page === 1 ? [] : events) as Record<
					string,
					FXEmpireEvent[]
				>
				for (const [date, events] of eventsQuery.events) {
					map[date] = [
						...(map[date] ?? []),
						...events.filter(e => !map[date]?.find(e_ => e_ === e))
					].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
				}
				return Object.entries(map)
			})
			setIsAtBottom(false)
			setIsFetchingLock(false)
			debugger
		}
	}, [eventsQuery, page])

	useEffect(() => {
		setPage(1)
	}, [startDate, endDate, impact, countries])

	useEffect(() => {
		if (eventsAreFetching) {
			setIsFetchingLock(true)
		}
	}, [eventsAreFetching])

	useEffect(() => {
		if (globalThis.window) {
			window.scrollTo(0, 0)
		}
	}, [])

	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Dashboard</title>
			</Head>

			<Text
				weight={700}
				size={36}
				my="md">
				Latest News
			</Text>

			<Grid gutter={20}>
				{news?.map(n => (
					<Grid.Col
						key={n.objectID}
						xs={12}
						md={6}
						lg={4}
						xl={3}>
						<Card
							component={Link}
							href={n.FullUrl}>
							<Card.Section withBorder>
								<Image
									style={{ objectFit: "contain" }}
									src={n.ImageUrl}
									height={180}
									alt={n.Title}
								/>
							</Card.Section>

							<Stack
								mt="sm"
								spacing="sm">
								<Text
									weight={600}
									size="md"
									lineClamp={2}>
									{n.Title}
								</Text>

								<Text
									size="xs"
									color="dimmed"
									lineClamp={3}>
									{n.Summary}
								</Text>
							</Stack>
						</Card>
					</Grid.Col>
				))}
			</Grid>

			<Text
				weight={700}
				size={36}
				mt="xl"
				mb="xs">
				Economic Calendar
			</Text>

			<Flex
				mb="md"
				gap="sm">
				<ActionIcon
					variant="filled"
					color="blue"
					size="lg"
					disabled={eventsAreFetching}>
					<IconFilter size="1.5rem" />
				</ActionIcon>

				<ActionIcon
					variant="filled"
					color="blue"
					size="lg"
					disabled={eventsAreFetching}>
					<IconCalendar size="1.5rem" />
				</ActionIcon>

				<SegmentedControl
					color={theme.colors.blue[5]}
					data={[
						{ value: "1", label: "Low" },
						{ value: "2", label: "Medium" },
						{ value: "3", label: "High" }
					]}
					value={impact + ""}
					onChange={e => setImpact(+e)}
					disabled={eventsAreFetching}
				/>
			</Flex>

			<AnimatePresence>
				<Table
					bg={theme.colors.dark[6]}
					highlightOnHover
					withBorder
					withColumnBorders
					sx={{
						"& th:not(:nth-of-type(3)), & td:not(:nth-of-type(3))": {
							textAlign: "center !important" as "center"
						}
					}}>
					<thead>
						<tr>
							<th>Time</th>
							<th>Currency</th>
							<th style={{ width: "40%" }}>Event</th>
							<th>Impact</th>
							<th>Actual</th>
							<th>Consensus</th>
							<th>Previous</th>
						</tr>
					</thead>
					<tbody>
						{events.map(([day, events]) => (
							<Fragment key={day}>
								<motion.tr
									layoutId={day}
									transition={{ duration: 0.5 }}>
									<Text
										bg={theme.colors.dark[5]}
										weight={700}
										component="td"
										colSpan={7}>
										{new Date(day).toLocaleDateString("en-SG", {
											weekday: "long",
											day: "2-digit",
											month: "long",
											year: "numeric"
										})}
									</Text>
								</motion.tr>
								{events.map(e => {
									const currency = CURRENCIES.find(
										c => e.country === FXEMPIRE_COUNTRIES[c]
									)!
									return (
										<motion.tr
											key={e.id}
											layoutId={e.id + ""}
											transition={{ duration: 0.5 }}>
											<td>
												{new Date(e.date).toLocaleTimeString("en-SG", {
													hour: "2-digit",
													minute: "2-digit"
												})}
											</td>
											<td>
												{CURRENCY_FLAGS[currency]}
												{" " + currency}
											</td>
											<td>{e.name}</td>
											<td>
												<Badge
													color={
														([, "yellow", "orange", "red"] as const)[
															e.impact
														]!
													}>
													{[, "Low", "Medium", "High"][e.impact]}
												</Badge>
											</td>
											<td
												style={{
													color: {
														above: theme.colors.green[5],
														below: theme.colors.red[5],
														none: theme.colors.dark[0]
													}[e.color]
												}}>
												{e.actual}
											</td>
											<td>{e.forecast}</td>
											<td>{e.previous}</td>
										</motion.tr>
									)
								})}
							</Fragment>
						))}
						{eventsQuery?.next && (
							<motion.tr
								ref={ref}
								layoutId="loader">
								<td colSpan={7}>
									<Loader
										size={20}
										color="gray"
										display="block"
										m="auto"
									/>
								</td>
							</motion.tr>
						)}
					</tbody>
				</Table>
			</AnimatePresence>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session, params }) => {
	return {
		props: {
			user: session.user ?? null
		}
	}
})
